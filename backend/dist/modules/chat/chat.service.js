import prisma from '../../common/services/prisma.service.js';
import { AIService } from '../../common/services/ai.service.js';
import { WeatherService } from '../../common/services/weather.service.js';
import { ShoppingListService } from '../shopping-list/shopping-list.service.js';
import { io, onlineUsers } from '../../socket.js';
export class ChatService {
    async processChatMessage(input) {
        const { message, ownerId, userId, sessionId, latitude, longitude, guestId, metadata } = input;
        if (!ownerId) {
            throw new Error('Owner ID is required for processing chat messages.');
        }
        // Check if store chat is enabled
        const owner = await prisma.owner.findUnique({
            where: { id: ownerId },
            include: { config: true }
        });
        if (owner?.config?.showChat === false) {
            return {
                message: `Mohon maaf, layanan asisten cerdas untuk toko ${owner.name} sedang dinonaktifkan sementara oleh pihak administrasi. Silakan hubungi pengelola toko untuk informasi lebih lanjut.`,
                status: 'GENERAL',
                sessionId: sessionId || null
            };
        }
        // 0. Get user details FIRST (needed for active call check and emitting)
        const user = userId ? await prisma.user.findUnique({
            where: { id: userId },
            select: { name: true, language: true, latitude: true, longitude: true, medicalRecord: true }
        }) : null;
        // 1. Check for active staff call immediately OR explicit staff target
        const activeCall = userId ? await prisma.chatHistory.findFirst({
            where: {
                user_id: userId,
                owner_id: ownerId,
                status: { in: ['CALL_PENDING', 'CALL_ACCEPTED'] }
            },
            orderBy: { timestamp: 'desc' }
        }) : null;
        // IF active call exists (CALL_ACCEPTED) OR explicit staffId provided
        if ((activeCall && activeCall.status === 'CALL_ACCEPTED') || (metadata && metadata.staffId)) {
            const chat = await prisma.chatHistory.create({
                data: {
                    user_id: userId || null, // Ensure explicit null if undefined
                    owner_id: ownerId,
                    message: message,
                    role: 'user',
                    // Use the overarching session status to keep it visible in the dashboard
                    // @ts-ignore
                    status: activeCall?.status || 'CALL_ACCEPTED',
                    timestamp: new Date(),
                    metadata: metadata ? metadata : undefined,
                    session_id: activeCall?.session_id || null // Link to session if exists
                }
            });
            // Emit to Store Room (for staff notifications)
            io.to(`store_${ownerId}`).emit('staff_message', {
                ...chat,
                user: { name: user?.name || 'User', id: userId }
            });
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
                    title: message.substring(0, 30) // Use first message as title
                }
            });
            currentSessionId = newSession.id;
        }
        else {
            // If session exists, check if title needs updating
            const session = await prisma.chatSession.findUnique({
                where: { id: currentSessionId }
            });
            if (session && session.title === 'New Chat') {
                await prisma.chatSession.update({
                    where: { id: currentSessionId },
                    data: { title: message.substring(0, 30) }
                });
            }
        }
        /* Temporarily disabled guest limits */
        // ...
        // 3. Search for products in DB using keywords
        const keywords = message
            .split(/[,\s.!?]+/)
            .filter(word => word.length > 2)
            .map(word => word.toLowerCase());
        const products = await prisma.product.findMany({
            where: {
                owner_id: ownerId,
                OR: keywords.length > 0 ? keywords.map(kw => ({
                    name: {
                        contains: kw,
                        mode: 'insensitive',
                    },
                })) : [{ name: { contains: message } }],
            },
            orderBy: {
                price: 'asc'
            }
        });
        const language = user?.language || 'id';
        const systemConfig = await prisma.systemConfig.findUnique({ where: { id: 'global' } });
        const systemPrompt = systemConfig?.aiSystemPrompt;
        // 4. Early Filtering: Guest vs. User Flow
        if (!userId) {
            const guestContext = products.length > 0
                ? "Products found:\n" + products.map((p) => `- ${p.name}, Price: ${p.price}, Location: Aisle ${p.aisle}, Rak ${p.rak}`).join('\n')
                : "No products matched your search. We've recorded this for the store owner.";
            const guestResponse = await AIService.generateGuestResponse(message, guestContext, language, systemPrompt);
            // Save and emit for Guest
            const guestUserChat = await prisma.chatHistory.create({
                data: {
                    user_id: null,
                    owner_id: ownerId,
                    session_id: currentSessionId,
                    message: message,
                    role: 'user',
                },
            });
            const guestAiChat = await prisma.chatHistory.create({
                data: {
                    user_id: null,
                    owner_id: ownerId,
                    session_id: currentSessionId,
                    message: guestResponse,
                    role: 'ai',
                },
            });
            // Emit to Owner
            io.to(ownerId).emit('chat_message', {
                id: guestUserChat.id,
                ownerId,
                sessionId: currentSessionId,
                message,
                role: 'user',
                timestamp: new Date(),
            });
            // Emit guest AI response to socket (if guestId exists)
            if (guestId) {
                io.to(guestId).emit('chat_message', {
                    id: guestAiChat.id,
                    ownerId,
                    sessionId: currentSessionId,
                    message: guestResponse,
                    role: 'ai',
                    timestamp: new Date(),
                });
            }
            return {
                id: guestAiChat.id,
                message: guestResponse,
                status: 'GENERAL',
                sessionId: currentSessionId,
                timestamp: guestAiChat.timestamp
            };
        }
        // --- CONTINUING RICH USER FLOW (Authenticated) ---
        // 5. Check for PENDING calls (User-only)
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
        // 6. Get Weather and Nearby Stores
        const userLat = latitude || user?.latitude;
        const userLng = longitude || user?.longitude;
        const weather = await WeatherService.getCurrentWeather(userLat, userLng);
        // ... existing logic for user ...
        const medicalContext = user?.medicalRecord ? `USER MEDICAL NOTES/ALLERGIES: ${user.medicalRecord}\nCRITICAL: DO NOT recommend products that conflict with these medical notes or allergies.` : "";
        const weatherContext = `CURRENT WEATHER: ${weather.temperature}°C, ${weather.condition}.`;
        let nearbyStoresContext = "";
        let nearbyStores = [];
        const cleanMsg = message.trim().toLowerCase();
        const isSimpleGreeting = (msg) => {
            const greetings = ['halo', 'hai', 'hi', 'hello', 'hallo', 'p', 'test', 'tes', 'ping', 'woi', 'woy'];
            return greetings.some(g => msg === g || msg.startsWith(g + ' '));
        };
        const isRejection = (msg) => {
            const rejections = ['g dulu', 'gak', 'enggak', 'no', 'skip', 'jangan', 'stop', 'g usah', 'gausah', 'ga dulu'];
            return rejections.some(r => msg.includes(r));
        };
        if (userLat && userLng && WeatherService.isProactiveFruitWeather(weather) && !isSimpleGreeting(cleanMsg) && !isRejection(cleanMsg)) {
            const ownerService = new (await import('../owner/owner.service.js')).OwnerService();
            const nearbyRes = await ownerService.findNearbyStores(userLat, userLng, 5);
            if (nearbyRes.status === 'success' && nearbyRes.stores.length > 0) {
                nearbyStores = nearbyRes.stores;
                nearbyStoresContext = "\n\nNEARBY STORES (for proactive suggestions):\n" +
                    nearbyRes.stores.map(s => `- ${s.name} (Distance: ${s.distance.toFixed(1)}km, Domain: ${s.domain})`).join('\n');
            }
        }
        const context = products.length > 0
            ? "Products found (USE THESE FOR RECOMMENDATIONS):\n" + products.map((p) => `- [ID: ${p.id}] Name: ${p.name}, Price: ${p.price}, Aisle: ${p.aisle}, Rak: ${p.rak}, Halal: ${p.halal}${p.description ? `, Description: ${p.description}` : ''}`).join('\n')
            : "No products found matching exactly. Please inform the user and ask if they mean something else, and tell them we recorded their request.";
        // 7. Get Session History for Context
        const sessionHistory = currentSessionId ? await prisma.chatHistory.findMany({
            where: { session_id: currentSessionId },
            orderBy: { timestamp: 'desc' },
            take: 10,
            select: { role: true, message: true, metadata: true }
        }) : [];
        // --- CONTEXT PERSISTENCE LOGIC ---
        // If no products found in current search, try to carry over from history
        let contextProducts = [...products];
        if (contextProducts.length === 0 && sessionHistory.length > 0) {
            // Find the last AI message that had products
            const lastAiWithProducts = sessionHistory.find((h) => h.role === 'ai' && h.metadata?.products?.length > 0);
            if (lastAiWithProducts) {
                contextProducts = lastAiWithProducts.metadata.products;
            }
        }
        const formattedHistory = sessionHistory.reverse();
        const safetyInstruction = `\n\nSAFETY INSTRUCTION: After your response, you MUST add exactly one tag: [SAFE_IDS: id1, id2, ...] listing the IDs of products from the context that are safe for this user based on their medical notes. Omit any products that are unsafe or allergic. If no context products are found or all are unsafe, use [SAFE_IDS: NONE].`;
        const contextStr = contextProducts.length > 0
            ? "Products currently in context (USE THESE FOR RECOMMENDATIONS & SAVING):\n" + contextProducts.map((p) => `- [ID: ${p.id}] Name: ${p.name}, Price: ${p.price}${p.aisle ? `, Aisle: ${p.aisle}` : ''}${p.rak ? `, Rak: ${p.rak}` : ''}${p.halal !== undefined ? `, Halal: ${p.halal}` : ''}${p.description ? `, Description: ${p.description}` : ''}`).join('\n')
            : "No products currently in context.";
        const fullContext = `${contextStr}\n\n${medicalContext}\n${weatherContext}${nearbyStoresContext}${safetyInstruction}`;
        const rawAiResponse = await AIService.generateChatResponse(message, fullContext, language, systemPrompt, formattedHistory, owner?.businessCategory || 'RETAIL');
        // Parse status and clean message
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
            // Use the keywords or the original message to log what was missing
            const query = keywords.length > 0 ? keywords.join(' ') : message.substring(0, 50);
            try {
                await prisma.missingRequest.upsert({
                    where: {
                        ownerId_query: {
                            ownerId: ownerId,
                            query: query
                        }
                    },
                    update: {
                        count: { increment: 1 }
                    },
                    create: {
                        ownerId: ownerId,
                        query: query,
                        count: 1
                    }
                });
            }
            catch (err) {
                console.error('Failed to log missing request:', err);
            }
        }
        // Extract SAFE_IDS and clean the message further
        let safeProductIds = [];
        const safeIdsMatch = cleanMessage.match(/\[SAFE_IDS:\s*([^\]]+)\]/);
        if (safeIdsMatch && safeIdsMatch[1]) {
            const idsStr = safeIdsMatch[1].trim();
            if (idsStr !== 'NONE') {
                safeProductIds = idsStr.split(',').map(id => id.trim());
            }
            cleanMessage = cleanMessage.replace(/\[SAFE_IDS:\s*[^\]]+\]/, '').trim();
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
        // Clean AUTO_ADD tags from message
        cleanMessage = cleanMessage.replace(/\[AUTO_ADD:\s*[^\]]+\]/g, '').trim();
        // Process [REMIND: content | date] tags
        let reminderAdded = false;
        const remindMatches = cleanMessage.matchAll(/\[REMIND:\s*([^\]|]+)\|?([^\]]*)\]/g);
        for (const match of remindMatches) {
            if (match[1] && userId) {
                const content = match[1].trim();
                const dateStr = match[2]?.trim();
                let remindAt = new Date();
                if (dateStr) {
                    try {
                        const parsedDate = new Date(dateStr);
                        if (!isNaN(parsedDate.getTime())) {
                            remindAt = parsedDate;
                        }
                    }
                    catch (e) {
                        console.error('Failed to parse reminder date:', dateStr);
                    }
                }
                else {
                    // Default to tomorrow 8 AM
                    remindAt.setDate(remindAt.getDate() + 1);
                    remindAt.setHours(8, 0, 0, 0);
                }
                try {
                    await prisma.reminder.create({
                        data: {
                            userId,
                            ownerId,
                            content,
                            remindAt,
                            status: 'PENDING'
                        }
                    });
                    reminderAdded = true;
                }
                catch (err) {
                    console.error('Failed to save reminder:', err);
                }
            }
        }
        // Clean REMIND tags from message
        cleanMessage = cleanMessage.replace(/\[REMIND:\s*[^\]]+\]/g, '').trim();
        // If matches found and user is authenticated, add to list
        if (autoAddedProductIds.length > 0 && userId) {
            const shoppingListService = new ShoppingListService();
            for (const pid of autoAddedProductIds) {
                try {
                    await shoppingListService.addItem(userId, pid);
                }
                catch (err) {
                    console.error(`Auto-add failed for product ${pid}:`, err);
                }
            }
        }
        // Filter products based on safeProductIds - EXCLUDE auto-added ones to avoid redundancy
        const filteredProducts = contextProducts.filter(p => safeProductIds.includes(p.id) && !autoAddedProductIds.includes(p.id));
        // 5. Save to ChatHistory with sessionId
        const userChat = await prisma.chatHistory.create({
            data: {
                user_id: userId,
                owner_id: ownerId,
                session_id: currentSessionId,
                message: message,
                role: 'user',
            },
        });
        const aiChat = await prisma.chatHistory.create({
            data: {
                user_id: userId,
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
        // Update session timestamp
        await prisma.chatSession.update({
            where: { id: currentSessionId },
            data: { updatedAt: new Date() }
        });
        // Emit socket event to Owner (Store) room
        io.to(ownerId).emit('chat_message', {
            id: userChat.id,
            userId,
            ownerId,
            sessionId: currentSessionId,
            message: message, // User message
            role: 'user',
            timestamp: userChat.timestamp || new Date(),
        });
        // Also emit user message back to user for multi-device sync or just to confirm receipt
        if (userId) {
            io.to(userId).emit('chat_message', {
                id: userChat.id,
                userId,
                ownerId,
                sessionId: currentSessionId,
                message: message,
                role: 'user',
                timestamp: userChat.timestamp || new Date(),
            });
        }
        // Emit AI response if exists
        if (cleanMessage && userId) {
            io.to(userId).emit('chat_message', {
                id: aiChat.id,
                userId,
                ownerId,
                sessionId: currentSessionId,
                message: cleanMessage,
                role: 'ai',
                timestamp: aiChat.timestamp || new Date(),
                status: status
            });
            // Also emit to Owner so they see AI reply?
            io.to(ownerId).emit('chat_message', {
                id: aiChat.id,
                userId,
                ownerId,
                sessionId: currentSessionId,
                message: cleanMessage,
                role: 'ai',
                timestamp: aiChat.timestamp || new Date(),
                status: status
            });
        }
        const config = await prisma.systemConfig.findUnique({ where: { id: 'global' } });
        const days = config?.chatRetentionDays || 7;
        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() - days);
        const deleted = await prisma.chatSession.deleteMany({
            where: {
                updatedAt: { lt: expirationDate }
            }
        });
        // Count AI messages in this session
        const aiMessageCount = await prisma.chatHistory.count({
            where: {
                session_id: currentSessionId,
                role: 'ai',
                status: 'GENERAL'
            }
        });
        let ratingPrompt = false;
        if (aiMessageCount === 5) {
            // Check if already rated
            const existingRating = await prisma.rating.findFirst({
                where: { session_id: currentSessionId }
            });
            if (!existingRating) {
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
            },
            cleanup: {
                deletedSessions: deleted.count
            }
        };
    }
    async getSessions(userId, ownerId, excludeStaffChats = false) {
        // Only include chatHistory if we need to filter
        const includeClause = excludeStaffChats ? {
            chatHistory: {
                select: { status: true }
            }
        } : undefined;
        const sessions = await prisma.chatSession.findMany({
            where: { userId, ownerId },
            orderBy: { updatedAt: 'desc' },
            ...(includeClause && { include: includeClause })
        });
        // Filter out sessions that only contain staff interactions
        if (excludeStaffChats) {
            const filteredSessions = sessions.filter((session) => {
                const hasStaffStatus = session.chatHistory.some((msg) => msg.status && ['CALL_PENDING', 'CALL_ACCEPTED', 'CALL_ENDED', 'CALL_DECLINED', 'STAFF_REPLY'].includes(msg.status));
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