import prisma from '../../common/services/prisma.service.js';
import { AIService } from '../../common/services/ai.service.js';
import { WeatherService } from '../../common/services/weather.service.js';
import { ShoppingListService } from '../shopping-list/shopping-list.service.js';
import { io, onlineUsers } from '../../socket.js';
import type { ChatInput } from './chat.schema.js';
import { OwnerService } from '../owner/owner.service.js';

export class ChatService {
  async processChatMessage(input: ChatInput & { metadata?: any }) {
    const { message, ownerId, userId, sessionId, latitude, longitude, guestId, metadata } = input;

    if (!ownerId) {
      throw new Error('Owner ID is required for processing chat messages.');
    }

    // 0. Parallel fetching of independent data
    const keywords = message
      .split(/[,\s.!?]+/)
      .filter(word => word.length > 2)
      .map(word => word.toLowerCase());

    const [owner, systemConfig, user, activeCall, products] = await Promise.all([
      prisma.owner.findUnique({
        where: { id: ownerId },
        include: { config: true }
      }),
      (prisma as any).systemConfig.findUnique({ where: { id: 'global' } }),
      userId ? prisma.user.findUnique({
        where: { id: userId },
        select: { name: true, language: true, latitude: true, longitude: true, medicalRecord: true, role: true } as any
      }) : Promise.resolve(null),
      userId ? prisma.chatHistory.findFirst({
        where: {
          user_id: userId,
          owner_id: ownerId,
          status: { in: ['CALL_PENDING', 'CALL_ACCEPTED'] }
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
      io.to(`store_${ownerId}`).emit('staff_message', {
        ...chat,
        user: { name: user?.name || 'User', id: userId }
      });

      return { status: 'success', type: 'support', chat };
    }

    // 2. Ensure we have a session (ONLY for AI chats)
    let currentSessionId = sessionId;
    if (!currentSessionId) {
      const newSession = await (prisma as any).chatSession.create({
        data: {
          userId: userId || null,
          ownerId,
          guestId: userId ? null : (guestId || 'anonymous'),
          title: message.substring(0, 30)
        }
      });
      currentSessionId = newSession.id;
    } else {
      const session = await (prisma as any).chatSession.findUnique({
        where: { id: currentSessionId }
      });
      if (session && (session as any).title === 'New Chat') {
        // Background title update (don't await)
        (prisma as any).chatSession.update({
          where: { id: currentSessionId },
          data: { title: message.substring(0, 30) }
        }).catch((e: Error) => console.error('Failed to update session title:', e));
      }
    }

    const language = (user as any)?.language || 'id';
    const systemPrompt = (systemConfig as any)?.aiSystemPrompt;

    // 4. Role Filtering: Guest (QUEST) vs. User (REGISTERED)
    const userRole = (userId && userId !== 'undefined' && userId !== 'null') ? "REG" : "QST";
    const category = keywords.length > 0 ? "PRODUCT_SEARCH" : "GENERAL_CHITCHAT";

    if (userRole === "QST") {
      const guestContext = products.length > 0
        ? products.map((p: any) => `${p.name}, Rp${p.price}, A${p.aisle}, R${p.rak}`).join('|')
        : "NONE";

      // Guest flow is simplified. We use a minimalist system prompt for guest to avoid basa-basi.
      const guestResponse = await AIService.generateGuestResponseStream(
        message,
        guestContext,
        language,
        "You are HEART v.1, a fast assistant. No small talk. No weather.",
        systemConfig,
        (chunk) => {
          if (guestId) {
            io.to(guestId).emit('ai_chunk', { sessionId: currentSessionId, chunk });
          }
        }
      );

      // Save and emit for Guest
      const guestUserChat = await (prisma as any).chatHistory.create({
        data: {
          user_id: null,
          owner_id: ownerId,
          session_id: currentSessionId,
          message: message,
          role: 'user',
        },
      });

      const guestAiChat = await (prisma as any).chatHistory.create({
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

    // 3. Parallel fetching of weather and history
    const userLat = latitude || (user as any)?.latitude;
    const userLng = longitude || (user as any)?.longitude;

    const [weather, sessionHistory] = await Promise.all([
      userRole === 'REG' ? WeatherService.getCurrentWeather(userLat as number, userLng as number) : Promise.resolve({ temperature: 0, condition: 'NONE' }),
      currentSessionId ? (prisma as any).chatHistory.findMany({
        where: { session_id: currentSessionId },
        orderBy: { timestamp: 'desc' },
        take: 10,
        select: { role: true, message: true, metadata: true }
      }) : Promise.resolve([])
    ]);

    // 4. Get Weather and Nearby Stores (if applicable)
    const cleanMsg = message.trim().toLowerCase();
    const isSmallTalkMsg = keywords.length === 0; // Simple heuristic for small talk

    const isRejection = (msg: string) => {
      const rejections = ['g dulu', 'gak', 'enggak', 'no', 'skip', 'jangan', 'stop', 'g usah', 'gausah', 'ga dulu'];
      return rejections.some(r => msg.includes(r));
    };

    let nearbyStoresContext = "";
    let nearbyStores: any[] = [];
    if (userRole === 'REG' && userLat && userLng && WeatherService.isProactiveFruitWeather(weather) && keywords.length > 0 && !isRejection(cleanMsg)) {
      const ownerService = new OwnerService();
      const nearbyRes = await ownerService.findNearbyStores(userLat as number, userLng as number, 5);
      if (nearbyRes.status === 'success' && nearbyRes.stores.length > 0) {
        nearbyStores = nearbyRes.stores;
        nearbyStoresContext = "\n\nNEARBY STORES (for proactive suggestions):\n" +
          nearbyRes.stores.map((s: any) => `- ${s.name} (Distance: ${s.distance.toFixed(1)}km, Domain: ${s.domain})`).join('\n');
      }
    }

    const medicalContext = (user as any)?.medicalRecord ? `USER MEDICAL NOTES/ALLERGIES: ${(user as any).medicalRecord}\nCRITICAL: DO NOT recommend products that conflict with these medical notes or allergies.` : "";
    const weatherContext = userRole === 'REG' ? `CURRENT WEATHER: ${weather.temperature}°C, ${weather.condition}.` : "";

    // --- CONTEXT PERSISTENCE LOGIC ---
    // If no products found in current search, try to carry over from history
    let contextProducts = [...products];
    if (contextProducts.length === 0 && sessionHistory.length > 0) {
      const lastAiWithProducts = sessionHistory.find((h: any) => h.role === 'ai' && h.metadata?.products?.length > 0);
      if (lastAiWithProducts) {
        contextProducts = lastAiWithProducts.metadata.products;
      }
    }

    const formattedHistory = [...sessionHistory].reverse();

    const contextStr = contextProducts.length > 0
      ? contextProducts.map((p: any) =>
        `[${p.id}] ${p.name}, Rp${p.price}${p.aisle ? `, A:${p.aisle}` : ''}${p.rak ? `, R:${p.rak}` : ''}${p.halal === true ? ', H' : ''}`
      ).join('|')
      : "NONE";

    const fullContext = `CTX_PRODS: ${contextStr}\nMED: ${medicalContext || 'NONE'}\nWTR: ${userRole === 'REG' ? `${weather.temperature}C, ${weather.condition}` : 'NONE'}\nNEARBY: ${nearbyStoresContext || 'NONE'}`;

    const rawAiResponse = await AIService.generateChatResponseStream(
      message,
      fullContext,
      language,
      systemPrompt,
      formattedHistory,
      owner?.businessCategory || 'RETAIL',
      ownerId,
      userRole,
      systemConfig,
      (chunk) => {
        if (userId) {
          io.to(userId).emit('ai_chunk', { sessionId: currentSessionId, chunk });
        }
      }
    );

    // Parse status and clean message
    let status = 'GENERAL';
    let cleanMessage = rawAiResponse;

    if (rawAiResponse.startsWith('[FOUND]')) {
      status = 'FOUND';
      cleanMessage = rawAiResponse.replace('[FOUND]', '').trim();
    } else if (rawAiResponse.startsWith('[NOT_FOUND]')) {
      status = 'NOT_FOUND';
      cleanMessage = rawAiResponse.replace('[NOT_FOUND]', '').trim();
    } else if (rawAiResponse.startsWith('[GENERAL]')) {
      status = 'GENERAL';
      cleanMessage = rawAiResponse.replace('[GENERAL]', '').trim();
    }

    // Log Missing Request if status is NOT_FOUND (background - non-blocking)
    if (status === 'NOT_FOUND' && ownerId) {
      const query = keywords.length > 0 ? keywords.join(' ') : message.substring(0, 50);
      (prisma as any).missingRequest.upsert({
        where: { ownerId_query: { ownerId, query } },
        update: { count: { increment: 1 } },
        create: { ownerId, query, count: 1 }
      }).catch((err: Error) => console.error('Failed to log missing request:', err));
    }

    // Extract SAFE_IDS and clean the message further
    let safeProductIds: string[] = [];
    const safeIdsMatch = cleanMessage.match(/\[SAFE_IDS:\s*([^\]]+)\]/);
    if (safeIdsMatch && safeIdsMatch[1]) {
      const idsStr = safeIdsMatch[1].trim();
      if (idsStr !== 'NONE') {
        safeProductIds = idsStr.split(',').map(id => id.trim());
      }
      cleanMessage = cleanMessage.replace(/\[SAFE_IDS:\s*[^\]]+\]/, '').trim();
    }

    // Process [AUTO_ADD: productId] tags
    let autoAddedProductIds: string[] = [];
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
          } catch (e) {
            console.error('Failed to parse reminder date:', dateStr);
          }
        } else {
          // Default to tomorrow 8 AM
          remindAt.setDate(remindAt.getDate() + 1);
          remindAt.setHours(8, 0, 0, 0);
        }

        try {
          await (prisma as any).reminder.create({
            data: {
              userId,
              ownerId,
              content,
              remindAt,
              status: 'PENDING'
            }
          });
          reminderAdded = true;
        } catch (err) {
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
        } catch (err) {
          console.error(`Auto-add failed for product ${pid}:`, err);
        }
      }
    }

    // Filter products based on safeProductIds - EXCLUDE auto-added ones to avoid redundancy
    const filteredProducts = contextProducts.filter(p =>
      safeProductIds.includes(p.id) && !autoAddedProductIds.includes(p.id)
    );

    // 5. Save to ChatHistory with sessionId
    const userChat = await (prisma as any).chatHistory.create({
      data: {
        user_id: userId,
        owner_id: ownerId,
        session_id: currentSessionId,
        message: message,
        role: 'user',
      },
    });

    const aiChat = await (prisma as any).chatHistory.create({
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

    // Update session timestamp + cleanup (background - non-blocking)
    const bgCleanup = async () => {
      try {
        await (prisma as any).chatSession.update({
          where: { id: currentSessionId },
          data: { updatedAt: new Date() }
        });
        const days = (systemConfig as any)?.chatRetentionDays || 7;
        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() - days);
        await (prisma as any).chatSession.deleteMany({
          where: { updatedAt: { lt: expirationDate } }
        });
      } catch (err) {
        console.error('Background cleanup failed:', err);
      }
    };
    bgCleanup(); // fire-and-forget

    // Emit socket event to Owner (Store) room — skip if sender is a CONTRIBUTOR
    const isContributorChat = (user as any)?.role === 'CONTRIBUTOR';
    if (!isContributorChat) {
      io.to(ownerId).emit('chat_message', {
        id: userChat.id,
        userId,
        ownerId,
        sessionId: currentSessionId,
        message: message,
        role: 'user',
        timestamp: userChat.timestamp || new Date(),
      });
    }

    // Also emit user message back to user for multi-device sync
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
      // Only broadcast AI response to owner room if not a contributor
      if (!isContributorChat) {
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
    }

    // Count AI messages in this session
    const aiMessageCount = await (prisma as any).chatHistory.count({
      where: {
        session_id: currentSessionId,
        role: 'ai',
        status: 'GENERAL'
      }
    });

    let ratingPrompt = false;
    if (aiMessageCount === 5) {
      // Check if already rated
      const existingRating = await (prisma as any).rating.findFirst({
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
      }
    };
  }

  async getSessions(userId: string, ownerId: string, excludeStaffChats: boolean = false) {
    // Only include chatHistory if we need to filter
    const includeClause = excludeStaffChats ? {
      chatHistory: {
        select: { status: true }
      }
    } : undefined;

    const sessions = await (prisma as any).chatSession.findMany({
      where: { userId, ownerId },
      orderBy: { updatedAt: 'desc' },
      ...(includeClause && { include: includeClause })
    });

    // Filter out sessions that only contain staff interactions
    if (excludeStaffChats) {
      const filteredSessions = sessions.filter((session: any) => {
        const hasStaffStatus = session.chatHistory.some((msg: any) =>
          msg.status && ['CALL_PENDING', 'CALL_ACCEPTED', 'CALL_ENDED', 'CALL_DECLINED', 'STAFF_REPLY'].includes(msg.status)
        );
        return !hasStaffStatus;
      });

      return { status: 'success', data: filteredSessions.map((s: any) => ({ id: s.id, userId: s.userId, ownerId: s.ownerId, title: s.title, createdAt: s.createdAt, updatedAt: s.updatedAt })) };
    }

    return { status: 'success', data: sessions };
  }

  async createChatSession(userId: string, ownerId: string) {
    const session = await (prisma as any).chatSession.create({
      data: {
        userId,
        ownerId,
        title: 'New Chat'
      }
    });
    return { status: 'success', data: session };
  }

  async getMessagesBySession(sessionId: string, excludeStaffChats: boolean = false) {
    const messages = await (prisma as any).chatHistory.findMany({
      where: { session_id: sessionId },
      orderBy: { timestamp: 'asc' }
    });

    if (excludeStaffChats) {
      const filteredMessages = messages.filter((msg: any) =>
        !msg.status || !['CALL_PENDING', 'CALL_ACCEPTED', 'CALL_ENDED', 'CALL_DECLINED', 'STAFF_REPLY'].includes(msg.status)
      );
      return { status: 'success', history: filteredMessages };
    }

    return { status: 'success', history: messages };
  }

  /**
   * Request human assistance (staff) - Creates a pending call
   */
  async requestStaff(userId: string, ownerId: string, latitude?: number, longitude?: number, targetStaffId?: string) {
    // 1. Get the ABSOLUTE latest interaction
    const latestInteraction = await prisma.chatHistory.findFirst({
      where: { user_id: userId, owner_id: ownerId },
      orderBy: { timestamp: 'desc' }
    });

    const isActive = latestInteraction && ['CALL_PENDING', 'CALL_ACCEPTED'].includes(latestInteraction.status as string);

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

  async stopStaffSupport(userId: string, ownerId: string, duration?: string) {
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

  async acceptCall(userId: string, ownerId: string) {
    const pendingCall = await prisma.chatHistory.findFirst({
      where: {
        user_id: userId,
        owner_id: ownerId,
        status: 'CALL_PENDING'
      },
      orderBy: { timestamp: 'desc' }
    });

    if (!pendingCall) throw new Error('No pending call found');

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

  async declineCall(userId: string, ownerId: string) {
    const pendingCall = await prisma.chatHistory.findFirst({
      where: {
        user_id: userId,
        owner_id: ownerId,
        status: 'CALL_PENDING'
      },
      orderBy: { timestamp: 'desc' }
    });

    if (!pendingCall) throw new Error('No pending call found');

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
  async getChatHistory(userId: string, hours: number = 24, since?: string) {
    let dateLimit: Date;

    if (since !== undefined && since !== null) {
      if (since === '0' || since === '') {
        // Return all history
        dateLimit = new Date(0);
      } else {
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
    } else {
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
    }
  }

  async deleteSession(sessionId: string, userId: string) {
    // 1. Verify session belongs to user
    const session = await (prisma as any).chatSession.findFirst({
      where: { id: sessionId, userId }
    });

    if (!session) throw new Error('Session not found or access denied');

    // 2. Clear session (Cascade delete handles history)
    await (prisma as any).chatSession.delete({
      where: { id: sessionId }
    });

    return { status: 'success', message: 'Session deleted successfully' };
  }

  async clearUserHistory(userId: string, ownerId: string) {
    await (prisma as any).chatSession.deleteMany({
      where: { userId, ownerId }
    });

    return { status: 'success', message: 'Chat history cleared' };
  }

  async getStoreStaff(ownerId: string) {
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
