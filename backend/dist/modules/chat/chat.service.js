import prisma from '../../common/services/prisma.service.js';
import { AIService } from '../../common/services/ai.service.js';
import { WeatherService } from '../../common/services/weather.service.js';
import { ShoppingListService } from '../shopping-list/shopping-list.service.js';
import { io, onlineUsers } from '../../socket.js';
import { OwnerService } from '../owner/owner.service.js';
export class ChatService {
    async processChatMessage(input) {
        const { message, ownerId, userId, sessionId, latitude, longitude, guestId, metadata, language: inputLanguage } = input;
        if (!ownerId) {
            throw new Error('Owner ID is required for processing chat messages.');
        }
        // 0. Parallel fetching of independent data
        const keywords = message
            .split(/[,\s.!?]+/)
            .filter(word => word.length > 2)
            .map(word => word.toLowerCase());
        const [owner, systemConfig, user, _staleCleanup, activeCall, products] = await Promise.all([
            prisma.owner.findUnique({
                where: { id: ownerId },
                include: { config: true }
            }),
            prisma.systemConfig.findUnique({ where: { id: 'global' } }),
            userId ? prisma.user.findUnique({
                where: { id: userId },
                select: { name: true, language: true, latitude: true, longitude: true, medicalRecord: true, role: true }
            }) : Promise.resolve(null),
            // Auto-expire stale pending/accepted calls older than 30 minutes
            userId ? prisma.chatHistory.updateMany({
                where: {
                    user_id: userId,
                    owner_id: ownerId,
                    status: { in: ['CALL_PENDING', 'CALL_ACCEPTED'] },
                    timestamp: { lt: new Date(Date.now() - 30 * 60 * 1000) } // older than 30 min
                },
                data: { status: 'CALL_ENDED' }
            }) : Promise.resolve(null),
            userId ? prisma.chatHistory.findFirst({
                where: {
                    user_id: userId,
                    owner_id: ownerId,
                    status: { in: ['CALL_PENDING', 'CALL_ACCEPTED'] },
                    timestamp: { gte: new Date(Date.now() - 30 * 60 * 1000) } // only last 30 min
                },
                orderBy: { timestamp: 'desc' }
            }) : Promise.resolve(null),
            prisma.product.findMany({
                where: {
                    owner_id: ownerId,
                    status: 'APPROVED',
                    OR: keywords.length > 0 ? keywords.map(kw => ({
                        name: { contains: kw, mode: 'insensitive' },
                    })) : [{ name: { contains: message } }],
                },
                orderBy: { price: 'asc' },
                take: 20
            })
        ]);
        if (owner?.config?.showChat === false) {
            return {
                message: `Mohon maaf, layanan asisten cerdas untuk toko ${owner.name} sedang dinonaktifkan sementara oleh pihak administrasi. Silakan hubungi pengelola toko untuk informasi lebih lanjut.`,
                status: 'GENERAL',
                sessionId: sessionId || null
            };
        }
        // 1. IF active call exists (CALL_ACCEPTED) OR explicit staffId provided
        if ((activeCall && activeCall.status === 'CALL_ACCEPTED') || (metadata && metadata.staffId)) {
            const chat = await prisma.chatHistory.create({
                data: {
                    user_id: userId || null,
                    owner_id: ownerId,
                    message: message,
                    role: 'user',
                    // @ts-ignore
                    status: activeCall?.status || 'CALL_ACCEPTED',
                    timestamp: new Date(),
                    metadata: metadata ? metadata : undefined,
                    session_id: activeCall?.session_id || null
                }
            });
            // Emit to Store Room (for staff notifications)
            // Privacy Fix: Don't emit if it's a self-chat (user sending to themselves)
            if (!(metadata?.staffId && metadata.staffId === userId)) {
                io.to(`store_${ownerId}`).emit('staff_message', {
                    ...chat,
                    user: { name: user?.name || 'User', id: userId }
                });
            }
            return { status: 'success', type: 'support', chat };
        }
        // 2. Ensure we have a session (ONLY for AI chats)
        let currentSessionId = sessionId;
        if (!currentSessionId) {
            const newSession = await prisma.chatSession.create({
                data: {
                    userId: userId || null,
                    ownerId,
                    guestId: userId ? null : (guestId || 'anonymous'),
                    title: message.substring(0, 30)
                }
            });
            currentSessionId = newSession.id;
        }
        else {
            const session = await prisma.chatSession.findUnique({
                where: { id: currentSessionId }
            });
            if (session && session.title === 'New Chat') {
                // Background title update (don't await)
                prisma.chatSession.update({
                    where: { id: currentSessionId },
                    data: { title: message.substring(0, 30) }
                }).catch((e) => console.error('Failed to update session title:', e));
            }
        }
        const language = inputLanguage || user?.language || 'id';
        // Determine prompts with fallbacks
        const defaultGuestPrompt = "You are HEART v.1, a smart and friendly store assistant. Help the guest with product information, including Aisle and Rack locations if available. Use natural and complete sentences in Indonesian. No small talk. No weather info.";
        const regPrompt = owner?.config?.aiSystemPrompt || systemConfig?.aiSystemPrompt || "You are Heart, an AI shopping assistant.";
        const guestPrompt = owner?.config?.aiGuestSystemPrompt || defaultGuestPrompt;
        // Merge system config with owner override
        const aiConfig = {
            ...systemConfig,
            ...(owner?.config ? {
                aiMaxTokens: owner.config.aiMaxTokens,
                aiTemperature: owner.config.aiTemperature,
                aiTopP: owner.config.aiTopP,
                aiTopK: owner.config.aiTopK,
            } : {}),
            stopSequences: []
        };
        // 4. Role Filtering: Guest (QUEST) vs. User (REGISTERED)
        const userRole = (userId && userId !== 'undefined' && userId !== 'null') ? "REG" : "QST";
        const category = keywords.length > 0 ? "PRODUCT_SEARCH" : "GENERAL_CHITCHAT";
        // 4. Parallel fetching of weather and history
        const userLat = latitude || user?.latitude;
        const userLng = longitude || user?.longitude;
        const [weather, sessionHistory] = await Promise.all([
            userRole === 'REG' ? WeatherService.getCurrentWeather(userLat, userLng) : Promise.resolve({ temperature: 0, condition: 'NONE' }),
            currentSessionId ? prisma.chatHistory.findMany({
                where: { session_id: currentSessionId },
                orderBy: { timestamp: 'desc' },
                take: 10,
                select: { role: true, message: true, metadata: true }
            }) : Promise.resolve([])
        ]);
        // 4. Get Weather and Nearby Stores (if applicable)
        const cleanMsg = message.trim().toLowerCase();
        const isRejection = (msg) => {
            const rejections = ['g dulu', 'gak', 'enggak', 'no', 'skip', 'jangan', 'stop', 'g usah', 'gausah', 'ga dulu'];
            return rejections.some(r => msg.includes(r));
        };
        let nearbyStoresContext = "";
        let nearbyStores = [];
        if (userRole === 'REG' && userLat && userLng && WeatherService.isProactiveFruitWeather(weather) && keywords.length > 0 && !isRejection(cleanMsg)) {
            const ownerService = new OwnerService();
            const nearbyRes = await ownerService.findNearbyStores(userLat, userLng, 5);
            if (nearbyRes.status === 'success' && nearbyRes.stores.length > 0) {
                nearbyStores = nearbyRes.stores;
                nearbyStoresContext = "\n\nNEARBY STORES (for proactive suggestions):\n" +
                    nearbyRes.stores.map((s) => `- ${s.name} (Distance: ${s.distance.toFixed(1)}km, Domain: ${s.domain})`).join('\n');
            }
        }
        const medicalContext = user?.medicalRecord ? `USER MEDICAL NOTES/ALLERGIES: ${user.medicalRecord}\nCRITICAL: DO NOT recommend products that conflict with these medical notes or allergies.` : "";
        const weatherContext = userRole === 'REG' ? `CURRENT WEATHER: ${weather.temperature}°C, ${weather.condition}.` : "";
        // --- CONTEXT PERSISTENCE LOGIC ---
        let contextProducts = [...products];
        if (contextProducts.length === 0 && sessionHistory.length > 0) {
            const lastAiWithProducts = sessionHistory.find((h) => h.role === 'ai' && h.metadata?.products?.length > 0);
            if (lastAiWithProducts) {
                contextProducts = lastAiWithProducts.metadata.products;
            }
        }
        const contextStr = contextProducts.length > 0
            ? contextProducts.map((p) => `[${p.id}] ${p.name}, Rp${p.price}${p.aisle ? `, A:${p.aisle}` : ''}${p.rak ? `, R:${p.rak}` : ''}${p.halal === true ? ', H' : ''}`).join('|')
            : "NONE";
        const formattedHistory = [...sessionHistory].reverse();
        const fullContext = `CTX_PRODS: ${contextStr}\nMED: ${medicalContext || 'NONE'}\nWTR: ${userRole === 'REG' ? `${weather.temperature}C, ${weather.condition}` : 'NONE'}\nNEARBY: ${nearbyStoresContext || 'NONE'}`;
        // 5. AI Call
        let rawAiResponse = "";
        if (userRole === "QST") {
            rawAiResponse = await AIService.generateGuestResponseStream(message, contextStr, language, guestPrompt, aiConfig, (chunk) => {
                if (guestId) {
                    io.to(guestId).emit('ai_chunk', { sessionId: currentSessionId, chunk });
                }
            }, formattedHistory);
        }
        else {
            // Check for active support session (SKIP AI if staff is handling)
            if (activeCall) {
                const tempMessageId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                const timestamp = new Date();
                io.to(`store_${ownerId}`).emit('staff_message', {
                    id: tempMessageId,
                    userId,
                    ownerId,
                    sessionId: currentSessionId,
                    message: message,
                    role: 'user',
                    timestamp: timestamp,
                    status: activeCall.status,
                    ephemeral: true,
                    user: { name: user?.name || 'User', id: userId }
                });
                return { status: 'success', type: 'pending', message: "Waiting for staff..." };
            }
            rawAiResponse = await AIService.generateChatResponseStream(message, fullContext, language, regPrompt, formattedHistory, owner?.businessCategory || 'RETAIL', ownerId, userRole, aiConfig, (chunk) => {
                if (userId) {
                    io.to(userId).emit('ai_chunk', { sessionId: currentSessionId, chunk });
                }
            });
        }
        // 6. Process AI Response (Common for both)
        let status = 'GENERAL';
        let cleanMessage = rawAiResponse;
        if (rawAiResponse.startsWith('[FOUND]')) {
            status = 'FOUND';
            cleanMessage = rawAiResponse.replace('[FOUND]', '').trim();
        }
        else if (rawAiResponse.startsWith('[NOT_FOUND]')) {
            status = 'NOT_FOUND';
            cleanMessage = rawAiResponse.replace('[NOT_FOUND]', '').trim();
        }
        else if (rawAiResponse.startsWith('[GENERAL]')) {
            status = 'GENERAL';
            cleanMessage = rawAiResponse.replace('[GENERAL]', '').trim();
        }
        // Log Missing Request if status is NOT_FOUND
        if (status === 'NOT_FOUND' && ownerId) {
            const query = keywords.length > 0 ? keywords.join(' ') : message.substring(0, 50);
            prisma.missingRequest.upsert({
                where: { ownerId_query: { ownerId, query } },
                update: { count: { increment: 1 } },
                create: { ownerId, query, count: 1 }
            }).catch((err) => console.error('Failed to log missing request:', err));
        }
        // Extract SAFE_IDS
        let safeProductIds = [];
        const safeIdsMatch = cleanMessage.match(/\[SAFE_IDS:\s*([^\]]+)\]/g);
        if (safeIdsMatch) {
            for (const match of safeIdsMatch) {
                const idMatch = match.match(/\[SAFE_IDS:\s*([^\]]+)\]/);
                if (idMatch && idMatch[1]) {
                    const idsStr = idMatch[1].trim();
                    if (idsStr !== 'NONE') {
                        const ids = idsStr.split(',').map(id => id.trim());
                        safeProductIds.push(...ids);
                    }
                }
            }
            cleanMessage = cleanMessage.replace(/\[SAFE_IDS:\s*[^\]]+\]/g, '').trim();
        }
        // Process [AUTO_ADD: productId] tags
        let autoAddedProductIds = [];
        const autoAddMatches = cleanMessage.matchAll(/\[AUTO_ADD:\s*([^\]]+)\]/g);
        for (const match of autoAddMatches) {
            if (match[1]) {
                const productId = match[1].trim();
                autoAddedProductIds.push(productId);
            }
        }
        cleanMessage = cleanMessage.replace(/\[AUTO_ADD:\s*[^\]]+\]/g, '').trim();
        // Process [REMIND: content | date] tags
        let reminderAdded = false;
        if (userId) {
            const remindMatches = cleanMessage.matchAll(/\[REMIND:\s*([^\]|]+)\|?([^\]]*)\]/g);
            for (const match of remindMatches) {
                if (match[1]) {
                    const content = match[1].trim();
                    const dateStr = match[2]?.trim();
                    let remindAt = new Date();
                    if (dateStr) {
                        try {
                            const parsedDate = new Date(dateStr);
                            if (!isNaN(parsedDate.getTime()))
                                remindAt = parsedDate;
                        }
                        catch (e) { }
                    }
                    else {
                        remindAt.setDate(remindAt.getDate() + 1);
                        remindAt.setHours(8, 0, 0, 0);
                    }
                    try {
                        await prisma.reminder.create({
                            data: { userId, ownerId, content, remindAt, status: 'PENDING' }
                        });
                        reminderAdded = true;
                    }
                    catch (err) { }
                }
            }
        }
        cleanMessage = cleanMessage.replace(/\[REMIND:\s*[^\]]+\]/g, '').trim();
        // Auto-add to list
        if (autoAddedProductIds.length > 0 && userId) {
            const shoppingListService = new ShoppingListService();
            for (const pid of autoAddedProductIds) {
                try {
                    await shoppingListService.addItem(userId, pid);
                }
                catch (err) { }
            }
        }
        // Filter products
        const filteredProducts = contextProducts.filter(p => safeProductIds.includes(p.id) && !autoAddedProductIds.includes(p.id));
        // 7. Save History
        const userChat = await prisma.chatHistory.create({
            data: {
                user_id: userId || null,
                owner_id: ownerId,
                session_id: currentSessionId,
                message: message,
                role: 'user',
            },
        });
        const aiChat = await prisma.chatHistory.create({
            data: {
                user_id: userId || null,
                owner_id: ownerId,
                session_id: currentSessionId,
                message: cleanMessage,
                // @ts-ignore
                status: status,
                role: 'ai',
                metadata: {
                    products: filteredProducts.length > 0 ? filteredProducts : null,
                    nearbyStores: nearbyStores.length > 0 ? nearbyStores : null,
                    userLocation: userLat && userLng ? { lat: userLat, lng: userLng } : null,
                    reminderAdded
                }
            },
        });
        // Background cleanup
        const bgCleanup = async () => {
            try {
                await prisma.chatSession.update({
                    where: { id: currentSessionId },
                    data: { updatedAt: new Date() }
                });
                const days = systemConfig?.chatRetentionDays || 7;
                const expirationDate = new Date();
                expirationDate.setDate(expirationDate.getDate() - days);
                await prisma.chatSession.deleteMany({
                    where: { updatedAt: { lt: expirationDate } }
                });
            }
            catch (err) { }
        };
        bgCleanup();
        // Emit socket events
        const isContributorChat = user?.role === 'CONTRIBUTOR';
        if (!isContributorChat) {
            io.to(ownerId).emit('chat_message', {
                id: userChat.id,
                userId: userId || null,
                ownerId,
                sessionId: currentSessionId,
                message,
                role: 'user',
                timestamp: userChat.timestamp || new Date(),
            });
        }
        const targetRoom = userId || guestId;
        if (targetRoom) {
            io.to(targetRoom).emit('chat_message', {
                id: userChat.id,
                userId: userId || null,
                ownerId,
                sessionId: currentSessionId,
                message,
                role: 'user',
                timestamp: userChat.timestamp || new Date(),
            });
            io.to(targetRoom).emit('chat_message', {
                id: aiChat.id,
                userId: userId || null,
                ownerId,
                sessionId: currentSessionId,
                message: cleanMessage,
                role: 'ai',
                timestamp: aiChat.timestamp || new Date(),
                status: status
            });
        }
        if (!isContributorChat && cleanMessage) {
            io.to(ownerId).emit('chat_message', {
                id: aiChat.id,
                userId: userId || null,
                ownerId,
                sessionId: currentSessionId,
                message: cleanMessage,
                role: 'ai',
                timestamp: aiChat.timestamp || new Date(),
                status: status
            });
        }
        // Rating prompt (Users only)
        let ratingPrompt = false;
        if (userId) {
            const aiMessageCount = await prisma.chatHistory.count({
                where: { session_id: currentSessionId, role: 'ai', status: 'GENERAL' }
            });
            if (aiMessageCount === 5) {
                const existingRating = await prisma.rating.findFirst({
                    where: { session_id: currentSessionId }
                });
                if (!existingRating)
                    ratingPrompt = true;
            }
        }
        return {
            id: aiChat.id,
            message: cleanMessage,
            status: status,
            sessionId: currentSessionId,
            timestamp: aiChat.timestamp,
            ratingPrompt,
            metadata: {
                products: filteredProducts.length > 0 ? filteredProducts : null,
                nearbyStores: nearbyStores.length > 0 ? nearbyStores : null,
                autoAdded: autoAddedProductIds.length > 0 ? autoAddedProductIds : null
            }
        };
    }
    async getSessions(userId, ownerId, excludeStaffChats = false) {
        const sessions = await prisma.chatSession.findMany({
            where: { userId, ownerId },
            orderBy: { updatedAt: 'desc' },
            ...(excludeStaffChats && {
                include: {
                    chats: {
                        select: { status: true }
                    }
                }
            })
        });
        if (excludeStaffChats) {
            const filteredSessions = sessions.filter((session) => {
                const hasStaffStatus = session.chats?.some((msg) => msg.status && ['CALL_PENDING', 'CALL_ACCEPTED', 'CALL_ENDED', 'CALL_DECLINED', 'STAFF_REPLY'].includes(msg.status));
                return !hasStaffStatus;
            });
            return { status: 'success', data: filteredSessions.map((s) => ({ id: s.id, userId: s.userId, ownerId: s.ownerId, title: s.title, createdAt: s.createdAt, updatedAt: s.updatedAt })) };
        }
        return { status: 'success', data: sessions };
    }
    async createChatSession(userId, ownerId) {
        const session = await prisma.chatSession.create({
            data: {
                userId,
                ownerId,
                title: 'New Chat'
            }
        });
        return { status: 'success', data: session };
    }
    async getMessagesBySession(sessionId, excludeStaffChats = false) {
        const messages = await prisma.chatHistory.findMany({
            where: { session_id: sessionId },
            orderBy: { timestamp: 'asc' }
        });
        if (excludeStaffChats) {
            const filteredMessages = messages.filter((msg) => !msg.status || !['CALL_PENDING', 'CALL_ACCEPTED', 'CALL_ENDED', 'CALL_DECLINED', 'STAFF_REPLY'].includes(msg.status));
            return { status: 'success', history: filteredMessages };
        }
        return { status: 'success', history: messages };
    }
    /**
     * Request human assistance (staff) - Creates a pending call
     */
    async requestStaff(userId, ownerId, latitude, longitude, targetStaffId) {
        // 1. Get the ABSOLUTE latest interaction
        const latestInteraction = await prisma.chatHistory.findFirst({
            where: { user_id: userId, owner_id: ownerId },
            orderBy: { timestamp: 'desc' }
        });
        const isActive = latestInteraction && ['CALL_PENDING', 'CALL_ACCEPTED'].includes(latestInteraction.status);
        if (isActive) {
            // If already active, update the location and timestamp of the EXISTING record
            await prisma.chatHistory.update({
                where: { id: latestInteraction.id },
                data: {
                    latitude: latitude ?? latestInteraction.latitude,
                    longitude: longitude ?? latestInteraction.longitude,
                    timestamp: new Date() // Refresh the call
                }
            });
            return { status: 'success', message: 'Chat request updated.' };
        }
        // Otherwise create a new pending call
        await prisma.chatHistory.create({
            data: {
                user_id: userId,
                owner_id: ownerId,
                message: "Sistem: User memerlukan bantuan staff. (System: User requires staff assistance.)",
                role: 'ai',
                // @ts-ignore
                status: 'CALL_PENDING',
                latitude: latitude ?? null,
                longitude: longitude ?? null
            },
        });
        const result = {
            status: 'success',
            message: 'Chat request sent. Waiting for staff.'
        };
        io.to(`store_${ownerId}`).emit('chat_requested', { userId, ownerId, targetStaffId, timestamp: new Date() });
        return result;
    }
    async stopStaffSupport(userId, ownerId, duration) {
        const durationText = duration ? ` durasi: ${duration}.` : "";
        // 1. Mark existing active calls as ENDED
        await prisma.chatHistory.updateMany({
            where: {
                user_id: userId,
                owner_id: ownerId,
                status: { in: ['CALL_PENDING', 'CALL_ACCEPTED'] }
            },
            data: {
                // @ts-ignore
                status: 'CALL_ENDED'
            }
        });
        // 2. Create the system termination message
        await prisma.chatHistory.create({
            data: {
                user_id: userId,
                owner_id: ownerId,
                message: `Sistem: Sesi bantuan staff berakhir.${durationText} User kembali ke AI. (System: Staff support session ended. User returned to AI.)`,
                role: 'ai',
                // @ts-ignore
                status: 'GENERAL',
            },
        });
        return { status: 'success', message: 'Support session ended.' };
    }
    async acceptCall(userId, ownerId) {
        const pendingCall = await prisma.chatHistory.findFirst({
            where: {
                user_id: userId,
                owner_id: ownerId,
                status: 'CALL_PENDING'
            },
            orderBy: { timestamp: 'desc' }
        });
        if (!pendingCall)
            throw new Error('No pending call found');
        await prisma.chatHistory.updateMany({
            where: {
                user_id: userId,
                owner_id: ownerId,
                status: 'CALL_PENDING'
            },
            data: {
                // @ts-ignore
                status: 'CALL_ACCEPTED',
                message: "Sistem: Staff telah bergabung ke chat. (System: Staff joined the chat.)"
            }
        });
        io.to(userId).emit('chat_accepted', { userId, ownerId, staffId: 'system' }); // Or actual staff ID if we had it in context
        return { status: 'success', message: 'Chat accepted' };
    }
    async declineCall(userId, ownerId) {
        const pendingCall = await prisma.chatHistory.findFirst({
            where: {
                user_id: userId,
                owner_id: ownerId,
                status: 'CALL_PENDING'
            },
            orderBy: { timestamp: 'desc' }
        });
        if (!pendingCall)
            throw new Error('No pending call found');
        await prisma.chatHistory.update({
            where: { id: pendingCall.id },
            data: {
                // @ts-ignore
                status: 'CALL_DECLINED',
                message: "Sistem: Staff menolak permintaan chat. (System: Staff declined the chat request.)"
            }
        });
        io.to(userId).emit('chat_declined', { userId, ownerId });
        return { status: 'success', message: 'Chat declined' };
    }
    /**
     * Get chat history for a user (Filtered by hours or since specific timestamp)
     * Keeping for backward compatibility or general overview
     */
    async getChatHistory(userId, hours = 24, since) {
        let dateLimit;
        if (since !== undefined && since !== null) {
            if (since === '0' || since === '') {
                // Return all history
                dateLimit = new Date(0);
            }
            else {
                dateLimit = new Date(since);
                // Validate the date
                if (isNaN(dateLimit.getTime())) {
                    // If invalid date string provided, fall back to epoch to be safe, or default?
                    // User provided a string but it's garbage. 
                    // Better to return 24h default OR return everything?
                    // Let's return everything if they tried to pass a param.
                    dateLimit = new Date(0);
                }
            }
        }
        else {
            dateLimit = new Date();
            dateLimit.setHours(dateLimit.getHours() - hours);
        }
        const history = await prisma.chatHistory.findMany({
            where: {
                user_id: userId,
                timestamp: {
                    gt: dateLimit
                }
            },
            orderBy: {
                timestamp: 'asc'
            },
            include: {
                owner: {
                    select: { name: true }
                }
            }
        });
        return {
            status: 'success',
            history
        };
    }
    async deleteSession(sessionId, userId) {
        // 1. Verify session belongs to user
        const session = await prisma.chatSession.findFirst({
            where: { id: sessionId, userId }
        });
        if (!session)
            throw new Error('Session not found or access denied');
        // 2. Clear session (Cascade delete handles history)
        await prisma.chatSession.delete({
            where: { id: sessionId }
        });
        return { status: 'success', message: 'Session deleted successfully' };
    }
    async clearUserHistory(userId, ownerId) {
        await prisma.chatSession.deleteMany({
            where: { userId, ownerId }
        });
        return { status: 'success', message: 'Chat history cleared' };
    }
    async getStoreStaff(ownerId) {
        const staff = await prisma.user.findMany({
            where: {
                memberOfId: ownerId,
                role: 'STAFF',
            },
            select: {
                id: true,
                name: true,
                role: true,
                image: true,
                position: true,
                updatedAt: true,
            }
        });
        const staffWithStatus = staff.map(s => ({
            ...s,
            isOnline: onlineUsers.has(s.id)
        }));
        return { status: 'success', staff: staffWithStatus };
    }
}
//# sourceMappingURL=chat.service.js.map