import prisma from '../../common/services/prisma.service.js';
import { AIService } from '../../common/services/ai.service.js';
import { WeatherService } from '../../common/services/weather.service.js';
import type { ChatInput } from './chat.schema.js';

export class ChatService {
  async processChatMessage(input: ChatInput) {
    const { message, ownerId, userId, sessionId, latitude, longitude } = input;

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

    // 0. Ensure we have a session
    let currentSessionId = sessionId;
    if (!currentSessionId) {
      const newSession = await (prisma as any).chatSession.create({
        data: {
          userId,
          ownerId,
          title: message.substring(0, 30) // Use first message as title
        }
      });
      currentSessionId = newSession.id;
    } else {
      // If session exists, check if title needs updating
      const session = await (prisma as any).chatSession.findUnique({
        where: { id: currentSessionId }
      });
      if (session && session.title === 'New Chat') {
        await (prisma as any).chatSession.update({
          where: { id: currentSessionId },
          data: { title: message.substring(0, 30) }
        });
      }
    }

    // 1. Search for products in DB using keywords
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

    // 2. Prepare context for Gemini
    let context = "";
    if (products.length > 0) {
      context = "Products found (USE THESE FOR RECOMMENDATIONS):\n" + products.map((p: any) =>
        `- [ID: ${p.id}] Name: ${p.name}, Price: ${p.price}, Aisle: ${p.aisle}, Rak: ${p.rak}, Halal: ${p.halal}${p.description ? `, Description: ${p.description}` : ''}`
      ).join('\n');
    } else {
      context = "No products found matching exactly. Please inform the user and ask if they mean something else, and tell them we recorded their request.";

      // Log missing request
      const existingRequest = await prisma.missingRequest.findFirst({
        where: { owner_id: ownerId, product_name: message }
      });

      if (existingRequest) {
        await prisma.missingRequest.update({
          where: { id: existingRequest.id },
          data: { count: { increment: 1 } }
        });
      } else {
        await prisma.missingRequest.create({
          data: { owner_id: ownerId, product_name: message, count: 1 }
        });
      }
    }

    // 3. Get user details (language and location)
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { language: true, latitude: true, longitude: true, medicalRecord: true } as any
    });

    const language = (user as any)?.language || 'id';

    // 4. Get Weather and Nearby Stores
    const userLat = latitude || (user as any)?.latitude;
    const userLng = longitude || (user as any)?.longitude;
    const weather = await WeatherService.getCurrentWeather(userLat as number, userLng as number);

    let nearbyStoresContext = "";
    let nearbyStores: any[] = [];
    const cleanMsg = message.trim().toLowerCase();

    const isSimpleGreeting = (msg: string) => {
      const greetings = ['halo', 'hai', 'hi', 'hello', 'hallo', 'p', 'test', 'tes', 'ping', 'woi', 'woy'];
      // Check exact match or starts with greeting + space (e.g. "woi halo")
      return greetings.some(g => msg === g || msg.startsWith(g + ' '));
    };

    const isRejection = (msg: string) => {
      const rejections = ['g dulu', 'gak', 'enggak', 'no', 'skip', 'jangan', 'stop', 'g usah', 'gausah', 'ga dulu'];
      return rejections.some(r => msg.includes(r));
    };

    if (userLat && userLng && WeatherService.isProactiveFruitWeather(weather) && !isSimpleGreeting(cleanMsg) && !isRejection(cleanMsg)) {
      const ownerService = new (await import('../owner/owner.service.js')).OwnerService();
      const nearbyRes = await ownerService.findNearbyStores(userLat as number, userLng as number, 5);
      if (nearbyRes.status === 'success' && nearbyRes.stores.length > 0) {
        nearbyStores = nearbyRes.stores;
        nearbyStoresContext = "\n\nNEARBY STORES (for proactive suggestions):\n" +
          nearbyRes.stores.map(s => `- ${s.name} (Distance: ${s.distance.toFixed(1)}km, Domain: ${s.domain})`).join('\n');
      }
    }

    // 5. Get Session History for Context
    const sessionHistory = currentSessionId ? await (prisma as any).chatHistory.findMany({
      where: { session_id: currentSessionId },
      orderBy: { timestamp: 'desc' },
      take: 10,
      select: { role: true, message: true }
    }) : [];

    // Sort history back to ascending for AI processing
    const formattedHistory = sessionHistory.reverse();

    // 6. Call Gemini with context, language, weather, and history
    const systemConfig = await (prisma as any).systemConfig.findUnique({ where: { id: 'global' } });
    const systemPrompt = systemConfig?.aiSystemPrompt;

    const medicalContext = (user as any)?.medicalRecord ? `USER MEDICAL NOTES/ALLERGIES: ${(user as any).medicalRecord}\nCRITICAL: DO NOT recommend products that conflict with these medical notes or allergies.` : "";
    const weatherContext = `CURRENT WEATHER: ${weather.temperature}°C, ${weather.condition}.`;
    const safetyInstruction = `\n\nSAFETY INSTRUCTION: After your response, you MUST add exactly one tag: [SAFE_IDS: id1, id2, ...] listing the IDs of products from the context that are safe for this user based on their medical notes. Omit any products that are unsafe or allergic. If no context products are found or all are unsafe, use [SAFE_IDS: NONE].`;
    const fullContext = `${context}\n\n${medicalContext}\n${weatherContext}${nearbyStoresContext}${safetyInstruction}`;

    const rawAiResponse = await AIService.generateChatResponse(message, fullContext, language, systemPrompt, formattedHistory);

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

    // Extract SAFE_IDS and clean the message further
    let safeProductIds: string[] = [];
    const safeIdsMatch = cleanMessage.match(/\[SAFE_IDS:\s*([^\]]+)\]/);
    if (safeIdsMatch) {
      const idsStr = safeIdsMatch[1].trim();
      if (idsStr !== 'NONE') {
        safeProductIds = idsStr.split(',').map(id => id.trim());
      }
      cleanMessage = cleanMessage.replace(/\[SAFE_IDS:\s*[^\]]+\]/, '').trim();
    }

    // Filter products based on safeProductIds
    const filteredProducts = products.filter(p => safeProductIds.includes(p.id));

    // 5. Save to ChatHistory with sessionId
    await (prisma as any).chatHistory.create({
      data: {
        user_id: userId,
        owner_id: ownerId,
        session_id: currentSessionId,
        message: message,
        role: 'user',
      },
    });

    await (prisma as any).chatHistory.create({
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
          userLocation: userLat && userLng ? { lat: userLat, lng: userLng } : null
        }
      },
    });

    // Update session timestamp
    await (prisma as any).chatSession.update({
      where: { id: currentSessionId },
      data: { updatedAt: new Date() }
    });

    return {
      message: cleanMessage,
      status: status,
      sessionId: currentSessionId,
      products: filteredProducts.length > 0 ? filteredProducts : null,
      nearbyStores: nearbyStores.length > 0 ? nearbyStores : null,
      userLocation: userLat && userLng ? { lat: userLat, lng: userLng } : null,
      ratingPrompt: "Gimana bantuan saya? Berikan rating ya! (How was my help? Please give a rating!)"
    };
  }

  async getSessions(userId: string, ownerId: string) {
    const sessions = await (prisma as any).chatSession.findMany({
      where: { userId, ownerId },
      orderBy: { updatedAt: 'desc' },
      select: { id: true, title: true, updatedAt: true, createdAt: true }
    });
    return { status: 'success', data: sessions };
  }

  async createChatSession(userId: string, ownerId: string) {
    const session = await (prisma as any).chatSession.create({
      data: {
        userId,
        ownerId,
        title: "New Chat"
      }
    });
    return { status: 'success', data: session };
  }

  async getMessagesBySession(sessionId: string) {
    const history = await (prisma as any).chatHistory.findMany({
      where: { session_id: sessionId },
      orderBy: { timestamp: 'asc' },
      select: {
        id: true,
        message: true,
        role: true,
        timestamp: true,
        status: true,
        metadata: true
      }
    });
    return { status: 'success', history };
  }

  /**
   * Automatically delete chats older than retention period
   */
  async cleanupOldChats() {
    const config = await (prisma as any).systemConfig.findUnique({ where: { id: 'global' } });
    const days = config?.chatRetentionDays || 7;
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() - days);

    // Prisma Cascade Delete will handle ChatHistory if we delete sessions
    const deleted = await (prisma as any).chatSession.deleteMany({
      where: {
        updatedAt: { lt: expirationDate }
      }
    });

    return { status: 'success', deletedCount: deleted.count };
  }

  /**
   * Request human assistance (staff) - Creates a pending call
   */
  async requestStaff(userId: string, ownerId: string, latitude?: number, longitude?: number) {
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
      return { status: 'success', message: 'Assistance request updated.' };
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

    return {
      status: 'success',
      message: 'Call initiated. Waiting for staff response.'
    };
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

    await prisma.chatHistory.update({
      where: { id: pendingCall.id },
      data: {
        // @ts-ignore
        status: 'CALL_ACCEPTED',
        message: "Sistem: Staff has accepted the call. (System: Staff accepted the call.)"
      }
    });

    return { status: 'success', message: 'Call accepted' };
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
        message: "Sistem: Staff declined the call. (System: Staff declined the call.)"
      }
    });

    return { status: 'success', message: 'Call declined' };
  }

  /**
   * Get chat history for a user (Filtered by hours or since specific timestamp)
   * Keeping for backward compatibility or general overview
   */
  async getChatHistory(userId: string, hours: number = 24, since?: string) {
    let dateLimit: Date;

    if (since && since.trim() !== '') {
      dateLimit = new Date(since);
      // Validate the date
      if (isNaN(dateLimit.getTime())) {
        dateLimit = new Date();
        dateLimit.setHours(dateLimit.getHours() - hours);
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
}
