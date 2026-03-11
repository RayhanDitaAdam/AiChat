function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; } import prisma from '../../common/services/prisma.service.js';

import { WeatherService } from '../../common/services/weather.service.js';
import { ShoppingListService } from '../shopping-list/shopping-list.service.js';
import { sseService } from '../../common/services/sse.service.js';

import { OwnerService } from '../owner/owner.service.js';
import { StatService } from '../stat/stat.service.js';
import { SopService } from '../sop/sop.service.js';
import { ChatPipelineService } from './services/pipeline.service.js';

const statService = new StatService();
const sopService = new SopService();
const chatPipelineService = new ChatPipelineService();

export class ChatService {
  async processChatMessage(input) {
    const { message, ownerId, userId, sessionId, latitude, longitude, guestId, metadata, language: inputLanguage } = input;

    // Cleanse inputs (sometimes frontend sends "null" or "undefined" as strings)
    const cleanUserId = (userId && userId !== 'null' && userId !== 'undefined') ? userId : null;
    const cleanOwnerId = (ownerId && ownerId !== 'null' && ownerId !== 'undefined') ? ownerId : null;

    if (!cleanOwnerId) {
      throw new Error('Owner ID is required for processing chat messages.');
    }

    const STOP_WORDS = [
      'ada', 'apa', 'ini', 'itu', 'sini', 'situ', 'mana', 'siapa', 'kapan', 'kenapa', 'bagaimana',
      'boleh', 'bisa', 'dong', 'sih', 'kok', 'kah', 'tuh', 'deh', 'aja', 'saja', 'juga', 'pun',
      'lagi', 'tadi', 'nanti', 'besok', 'kemarin', 'udah', 'sudah', 'telah', 'sedang', 'akan',
      'mau', 'ingin', 'tahu', 'bilang', 'tanya', 'cakap', 'ngomong', 'tampil', 'kasih', 'beri',
      'tunjuk', 'lihat', 'cari', 'temu', 'buka', 'tutup', 'buat', 'bikin', 'pakai', 'guna',
      'untuk', 'buat', 'demi', 'pada', 'kepada', 'bagi', 'dari', 'sejak', 'hingga', 'sampai',
      'dengan', 'tanpa', 'serta', 'bersama', 'bre', 'kah', 'nih', 'tuh', 'ya', 'ga', 'gak', 'enggak',
      'disini', 'disitu', 'dimana', 'kemana', 'darimana', 'disana', 'is', 'are', 'was', 'were',
      'have', 'has', 'had', 'do', 'does', 'did', 'shall', 'should', 'will', 'would', 'may',
      'might', 'must', 'can', 'could', 'the', 'a', 'an', 'some', 'any', 'none', 'every',
      'each', 'all', 'few', 'little', 'many', 'much', 'most', 'some', 'other', 'another',
      'such', 'what', 'which', 'who', 'whom', 'whose', 'when', 'where', 'why', 'how',
      'apakah', 'permisi', 'numpang', 'tanya', 'carikan', 'sediakan', 'menyediakan', 'mencari',
      'nyari', 'jual', 'jualan', 'beli', 'belikan', 'dong', 'punya', 'ada', 'ga', 'gak', 'ngga',
      'kok', 'sih', 'tuh', 'deh', 'aja', 'saja', 'juga', 'pun', 'ya', 'kh', 'ad', 'gk', 'adalah',
      'itu', 'ini', 'begitu', 'begini', 'oleh', 'ke', 'dari', 'dan', 'atau', 'tetapi', 'sangat',
      'amat', 'sekali', 'banget', 'bgt', 'paling', 'lebih', 'kurang', 'terlalu'
    ];

    const keywords = message
      .split(/[,\s.!?]+/)
      .filter((word) => word.length > 2)
      .map((word) => word.toLowerCase())
      .filter((word) => !STOP_WORDS.includes(word));

    const isSopQuery = keywords.some((kw) => ['sop', 'policy', 'aturan', 'perda', 'peraturan', 'rule', 'rules', 'pasal', 'bab', 'kebijakan', 'manual', 'panduan', 'dokumen'].includes(kw));

    const [owner, systemConfig, user, _staleCleanup, activeCall] = await Promise.all([
      prisma.owner.findUnique({
        where: { id: cleanOwnerId },
        include: { config: true }
      }),
      (prisma).systemConfig.findUnique({ where: { id: 'global' } }),
      cleanUserId ? prisma.user.findUnique({
        where: { id: cleanUserId },
        select: { id: true, name: true, language: true, latitude: true, longitude: true, medicalRecord: true, role: true }
      }) : Promise.resolve(null),
      // Auto-expire stale pending/accepted calls older than 30 minutes
      cleanUserId ? prisma.chatHistory.updateMany({
        where: {
          user_id: cleanUserId,
          owner_id: cleanOwnerId,
          status: { in: ['CALL_PENDING', 'CALL_ACCEPTED'] },
          timestamp: { lt: new Date(Date.now() - 30 * 60 * 1000) } // older than 30 min
        },
        data: { status: 'CALL_ENDED' }
      }) : Promise.resolve(null),
      cleanUserId ? prisma.chatHistory.findFirst({
        where: {
          user_id: cleanUserId,
          owner_id: cleanOwnerId,
          status: { in: ['CALL_PENDING', 'CALL_ACCEPTED'] },
          timestamp: { gte: new Date(Date.now() - 30 * 60 * 1000) } // only last 30 min
        },
        orderBy: { timestamp: 'desc' }
      }) : Promise.resolve(null)
    ]);

    if (_optionalChain([owner, 'optionalAccess', _ => _.config, 'optionalAccess', _2 => _2.showChat]) === false) {
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
          user_id: cleanUserId,
          owner_id: cleanOwnerId,
          message: message,
          role: 'user',
          // @ts-ignore
          status: _optionalChain([activeCall, 'optionalAccess', _3 => _3.status]) || 'CALL_ACCEPTED',
          timestamp: new Date(),
          metadata: metadata ? metadata : undefined,
          session_id: _optionalChain([activeCall, 'optionalAccess', _4 => _4.session_id]) || null
        }
      });

      // Emit to Store Room (for staff notifications)
      // Privacy Fix: Don't emit if it's a self-chat (user sending to themselves)
      if (!(_optionalChain([metadata, 'optionalAccess', _5 => _5.staffId]) && metadata.staffId === cleanUserId)) {
        sseService.broadcast(`store_${cleanOwnerId}`, 'staff_message', {
          ...chat,
          user: { name: _optionalChain([user, 'optionalAccess', _6 => _6.name]) || 'User', id: cleanUserId }
        });
      }

      return { status: 'success', type: 'support', chat };
    }

    // 2. Ensure we have a session (ONLY for AI chats)
    let currentSessionId = sessionId;
    if (!currentSessionId) {
      const newSession = await (prisma).chatSession.create({
        data: {
          userId: cleanUserId,
          ownerId: cleanOwnerId,
          guestId: cleanUserId ? null : (guestId || 'anonymous'),
          title: message.substring(0, 30)
        }
      });
      currentSessionId = newSession.id;
    } else {
      const session = await (prisma).chatSession.findUnique({
        where: { id: currentSessionId }
      });
      if (session && (session).title === 'New Chat') {
        // Background title update (don't await)
        (prisma).chatSession.update({
          where: { id: currentSessionId },
          data: { title: message.substring(0, 30) }
        }).catch((e) => console.error('Failed to update session title:', e));
      }
    }

    const language = inputLanguage || _optionalChain([(user), 'optionalAccess', _7 => _7.language]) || 'id';

    const isManagement = _optionalChain([(user), 'optionalAccess', _8 => _8.role]) === 'OWNER' || _optionalChain([(user), 'optionalAccess', _9 => _9.role]) === 'STAFF' || _optionalChain([(user), 'optionalAccess', _10 => _10.role]) === 'ADMIN';

    // Determine prompts with fallbacks
    const companyName = _optionalChain([(systemConfig), 'optionalAccess', _11 => _11.companyName]) || 'HeartAI';
    const defaultGuestPrompt = `You are ${companyName} v.1, a smart and friendly store assistant. Help the guest with product information, including Aisle and Rack locations if available. Use natural and complete sentences in Indonesian. No small talk. No weather info.`;

    let regPrompt = _optionalChain([(systemConfig), 'optionalAccess', _12 => _12.aiSystemPrompt]) || `You are ${companyName}, an AI shopping assistant.`;

    let guestPrompt = _optionalChain([(systemConfig), 'optionalAccess', _13 => _13.aiGuestSystemPrompt]) || defaultGuestPrompt;

    // Override both prompts for management persona if applicable
    if (isManagement || isSopQuery) {
      const mgmtPrompt = `You are ${companyName}-MGMT, the Company Management Assistant. Role: ${_optionalChain([user, 'optionalAccess', _14 => _14.role]) || 'GUEST'}.
      Your primary purpose is to analyze internal store data and company SOPs/policies. 
      CRITICAL: NEVER greet as "${companyName}" or a shopping assistant. DO NOT suggest products.
      If this is an SOP query, YOU MUST search \`companyDocs\` first.
      Use [NAVIGATE: SOP] if they ask to see the full document.
      Quote exact text from docs when answering.`;

      regPrompt = mgmtPrompt;
      guestPrompt = mgmtPrompt; // Ensure guests also see the MGMT persona for SOP queries
    }

    // Merge system config with owner override
    const aiConfig = {
      ...(systemConfig),
      ...(_optionalChain([owner, 'optionalAccess', _15 => _15.config]) ? {
        aiMaxTokens: owner.config.aiMaxTokens,
        aiTemperature: owner.config.aiTemperature,
        aiTopP: owner.config.aiTopP,
        aiTopK: owner.config.aiTopK,
      } : {}),
      stopSequences: []
    };

    // Boost token limit for SOP/Management queries
    if (isSopQuery || isManagement) {
      aiConfig.aiMaxTokens = 8192;
    }

    // 4. Role Filtering: Guest (QUEST) vs. User (REGISTERED)
    const userRole = cleanUserId ? "REG" : "QST";
    const category = keywords.length > 0 ? "PRODUCT_SEARCH" : "GENERAL_CHITCHAT";

    // 4. Parallel fetching of weather and history
    const userLat = latitude || _optionalChain([(user), 'optionalAccess', _16 => _16.latitude]);
    const userLng = longitude || _optionalChain([(user), 'optionalAccess', _17 => _17.longitude]);

    const [weather, sessionHistory] = await Promise.all([
      userRole === 'REG' ? WeatherService.getCurrentWeather(userLat, userLng) : Promise.resolve({ temperature: 0, condition: 'NONE' }),
      currentSessionId ? (prisma).chatHistory.findMany({
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

    const medicalContext = _optionalChain([(user), 'optionalAccess', _18 => _18.medicalRecord]) ? `USER MEDICAL NOTES/ALLERGIES: ${(user).medicalRecord}\nCRITICAL: DO NOT recommend products that conflict with these medical notes or allergies.` : "";
    const weatherContext = userRole === 'REG' ? `CURRENT WEATHER: ${weather.temperature}°C, ${weather.condition}.` : "";

    const formattedHistory = [...sessionHistory].reverse();

    // 5. Lazy Data Fetching (Only if needed by Pipeline)
    const [products, sops, stats] = await Promise.all([
      // Only fetch products if it looks like a product query
      (keywords.length > 0 || cleanMsg.includes('cari') || cleanMsg.includes('ada')) ? prisma.product.findMany({
        where: {
          owner_id: cleanOwnerId,
          status: 'APPROVED',
          AND: keywords.length > 0 ? keywords.map(kw => ({
            OR: [
              { name: { contains: kw, mode: 'insensitive' } },
              { category: { contains: kw, mode: 'insensitive' } },
              { description: { contains: kw, mode: 'insensitive' } }
            ]
          })) : [{ name: { contains: message } }],
        },
        orderBy: { price: 'asc' },
        take: 50
      }) : Promise.resolve([]),
      // Fetch SOPs if user is STAFF/OWNER or it's an SOP query
      (isManagement || isSopQuery) ? sopService.getSopsByOwner(cleanOwnerId) : Promise.resolve([]),
      // Fetch Stats if user is STAFF/OWNER
      isManagement ? statService.getOwnerStats(cleanOwnerId) : Promise.resolve(null)
    ]);

    // --- CONTEXT PERSISTENCE LOGIC ---
    let contextProducts = [...products];
    if (contextProducts.length === 0 && sessionHistory.length > 0) {
      const lastAiWithProducts = sessionHistory.find((h) => h.role === 'ai' && _optionalChain([h, 'access', _19 => _19.metadata, 'optionalAccess', _20 => _20.products, 'optionalAccess', _21 => _21.length]) > 0);
      if (lastAiWithProducts) {
        contextProducts = (lastAiWithProducts.metadata).products;
      }
    }

    const contextStr = contextProducts.length > 0
      ? contextProducts.map((p) =>
        `[${p.id}] ${p.name}, Rp${p.price}, S:${p.stock}${p.aisle ? `, A:${p.aisle}` : ''}${p.rak ? `, R:${p.rak}` : ''}${p.halal === true ? ', H' : ''}`
      ).join('|')
      : "NONE";

    const formattedSops = (sops || []).map((sop) => ({
      title: sop.title,
      content: (sop.content || '').substring(0, 10000)
    }));

    const managementContext = (isManagement || isSopQuery) ? `MGMT_STATS: ${JSON.stringify(_optionalChain([(stats), 'optionalAccess', _22 => _22.stats]) || [])}\ncompanyDocs: ${JSON.stringify(formattedSops)}` : "NONE";

    const fullContext = `CTX_PRODS: ${contextStr}\nMED: ${medicalContext || 'NONE'}\nWTR: ${userRole === 'REG' ? `${weather.temperature}C, ${weather.condition}` : 'NONE'}\nNEARBY: ${nearbyStoresContext || 'NONE'}\n${(isManagement || isSopQuery) ? managementContext : ''}`;

    // 5. AI Call through efficient Pipeline Orchestrator!
    let rawAiResponse = "";

    // Check for active support session (SKIP AI if staff is handling)
    if (activeCall && userRole !== "QST") {
      const tempMessageId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const timestamp = new Date();
      sseService.broadcast(`store_${cleanOwnerId}`, 'staff_message', {
        id: tempMessageId,
        userId: cleanUserId,
        ownerId: cleanOwnerId,
        sessionId: currentSessionId,
        message: message,
        role: 'user',
        timestamp: timestamp,
        status: activeCall.status,
        ephemeral: true,
        user: { name: _optionalChain([user, 'optionalAccess', _23 => _23.name]) || 'User', id: cleanUserId }
      });
      return { status: 'success', type: 'pending', message: "Waiting for staff..." };
    }

    // Determine target socket room for streaming
    const targetSocketId = userRole === 'QST' ? guestId : cleanUserId;

    // Process through Pipeline: Cache -> Intent -> FAQ/Action -> Fallback LLM
    const pipelineResult = await chatPipelineService.process(
      message,
      formattedHistory,
      cleanUserId,
      cleanOwnerId,
      language,
      userRole === "QST" ? guestPrompt : regPrompt,
      fullContext,
      aiConfig,
      (chunk) => {
        if (targetSocketId) {
          sseService.broadcast(targetSocketId, 'ai_chunk', { sessionId: currentSessionId, chunk });
        }
      }
    );

    rawAiResponse = pipelineResult.answer;
    if (_optionalChain([pipelineResult, 'access', _24 => _24.metadata, 'optionalAccess', _25 => _25.products])) {
      contextProducts = [...contextProducts, ...pipelineResult.metadata.products];
    }

    // 6. Process AI Response (Common for both)
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
    } else if (rawAiResponse.startsWith('[SOP]')) {
      status = 'SOP';
      cleanMessage = rawAiResponse.replace('[SOP]', '').trim();
    } else if (rawAiResponse.startsWith('[NAVIGATE: SOP]')) {
      status = 'SOP_NAVIGATE';
      cleanMessage = rawAiResponse.replace('[NAVIGATE: SOP]', '').trim();
    }

    // Force SOP status if it's an SOP query but AI didn't tag correctly
    if (isSopQuery) {
      const lowerMsg = message.toLowerCase();
      const isNavIntent = ['show', 'open', 'tampilkan', 'lihat', 'buka', 'daftar'].some(v => lowerMsg.includes(v));

      if (isNavIntent) {
        status = 'SOP_NAVIGATE';
      } else if (status === 'GENERAL') {
        status = 'SOP';
      }
    }

    // Log Missing Request if status is NOT_FOUND
    if (status === 'NOT_FOUND' && cleanOwnerId) {
      const query = keywords.length > 0 ? keywords.join(' ') : message.substring(0, 50);
      (prisma).missingRequest.upsert({
        where: { ownerId_query: { ownerId: cleanOwnerId, query } },
        update: { count: { increment: 1 } },
        create: { ownerId: cleanOwnerId, query, count: 1 }
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
    if (cleanUserId) {
      const remindMatches = cleanMessage.matchAll(/\[REMIND:\s*([^\]|]+)\|?([^\]]*)\]/g);
      for (const match of remindMatches) {
        if (match[1]) {
          const content = match[1].trim();
          const dateStr = _optionalChain([match, 'access', _26 => _26[2], 'optionalAccess', _27 => _27.trim, 'call', _28 => _28()]);
          let remindAt = new Date();
          if (dateStr) {
            try {
              const parsedDate = new Date(dateStr);
              if (!isNaN(parsedDate.getTime())) remindAt = parsedDate;
            } catch (e) { }
          } else {
            remindAt.setDate(remindAt.getDate() + 1);
            remindAt.setHours(8, 0, 0, 0);
          }
          try {
            await (prisma).reminder.create({
              data: { userId: cleanUserId, ownerId: cleanOwnerId, content, remindAt, status: 'PENDING' }
            });
            reminderAdded = true;
          } catch (err) { }
        }
      }
    }
    cleanMessage = cleanMessage.replace(/\[REMIND:\s*[^\]]+\]/g, '').trim();

    // Auto-add to list
    if (autoAddedProductIds.length > 0 && cleanUserId) {
      const shoppingListService = new ShoppingListService();
      for (const pid of autoAddedProductIds) {
        try { await shoppingListService.addItem(cleanUserId, pid); } catch (err) { }
      }
    }

    // Filter products
    const filteredProducts = contextProducts.filter(p =>
      safeProductIds.includes(p.id) && !autoAddedProductIds.includes(p.id)
    );

    // 7. Save History
    const userChat = await (prisma).chatHistory.create({
      data: {
        user_id: cleanUserId,
        owner_id: cleanOwnerId,
        session_id: currentSessionId,
        message: message,
        role: 'user',
      },
    });

    const aiChat = await (prisma).chatHistory.create({
      data: {
        user_id: cleanUserId,
        owner_id: cleanOwnerId,
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
        await (prisma).chatSession.update({
          where: { id: currentSessionId },
          data: { updatedAt: new Date() }
        });
        const days = _optionalChain([(systemConfig), 'optionalAccess', _29 => _29.chatRetentionDays]) || 7;
        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() - days);
        await (prisma).chatSession.deleteMany({
          where: { updatedAt: { lt: expirationDate } }
        });
      } catch (err) { }
    };
    bgCleanup();

    // Emit socket events
    const isContributorChat = _optionalChain([(user), 'optionalAccess', _30 => _30.role]) === 'CONTRIBUTOR';
    const targetRoom = userId || guestId;

    if (!isContributorChat) {
      // Avoid double broadcast if user room is the owner room (e.g. self-chat or owner testing)
      if (ownerId !== targetRoom) {
        sseService.broadcast(ownerId, 'chat_message', {
          id: userChat.id,
          userId: userId || null,
          ownerId,
          sessionId: currentSessionId,
          message,
          role: 'user',
          timestamp: userChat.timestamp || new Date(),
        });
      }
    }

    if (targetRoom) {
      sseService.broadcast(targetRoom, 'chat_message', {
        id: userChat.id,
        userId: userId || null,
        ownerId,
        sessionId: currentSessionId,
        message,
        role: 'user',
        timestamp: userChat.timestamp || new Date(),
      });

      sseService.broadcast(targetRoom, 'chat_message', {
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

    if (ownerId !== targetRoom && !isContributorChat && cleanMessage) {
      sseService.broadcast(ownerId, 'chat_message', {
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
      const aiMessageCount = await (prisma).chatHistory.count({
        where: { session_id: currentSessionId, role: 'ai', status: 'GENERAL' }
      });
      if (aiMessageCount === 5) {
        const existingRating = await (prisma).rating.findFirst({
          where: { session_id: currentSessionId }
        });
        if (!existingRating) ratingPrompt = true;
      }
    }

    return {
      id: aiChat.id,
      userChatId: userChat.id,
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
    const sessions = await (prisma).chatSession.findMany({
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
        const hasStaffStatus = _optionalChain([session, 'access', _31 => _31.chats, 'optionalAccess', _32 => _32.some, 'call', _33 => _33((msg) =>
          msg.status && ['CALL_PENDING', 'CALL_ACCEPTED', 'CALL_ENDED', 'CALL_DECLINED', 'STAFF_REPLY'].includes(msg.status)
        )]);
        return !hasStaffStatus;
      });

      return { status: 'success', data: filteredSessions.map((s) => ({ id: s.id, userId: s.userId, ownerId: s.ownerId, title: s.title, createdAt: s.createdAt, updatedAt: s.updatedAt, isPinned: s.isPinned })) };
    }

    return { status: 'success', data: sessions };
  }

  async toggleSessionPin(sessionId, userId) {
    const session = await (prisma).chatSession.findUnique({
      where: { id: sessionId }
    });
    if (!session || session.userId !== userId) {
      throw new Error('Session not found or forbidden');
    }
    const updated = await (prisma).chatSession.update({
      where: { id: sessionId },
      data: { isPinned: !session.isPinned }
    });
    return { status: 'success', data: updated };
  }

  async createChatSession(userId, ownerId) {
    const session = await (prisma).chatSession.create({
      data: {
        userId,
        ownerId,
        title: 'New Chat'
      }
    });
    return { status: 'success', data: session };
  }

  async getMessagesBySession(sessionId, excludeStaffChats = false) {
    const messages = await (prisma).chatHistory.findMany({
      where: { session_id: sessionId },
      orderBy: { timestamp: 'asc' }
    });

    if (excludeStaffChats) {
      const filteredMessages = messages.filter((msg) =>
        !msg.status || !['CALL_PENDING', 'CALL_ACCEPTED', 'CALL_ENDED', 'CALL_DECLINED', 'STAFF_REPLY'].includes(msg.status)
      );
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
          latitude: _nullishCoalesce(latitude, () => (latestInteraction.latitude)),
          longitude: _nullishCoalesce(longitude, () => (latestInteraction.longitude)),
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
        latitude: _nullishCoalesce(latitude, () => (null)),
        longitude: _nullishCoalesce(longitude, () => (null))
      },
    });

    const result = {
      status: 'success',
      message: 'Chat request sent. Waiting for staff.'
    };

    sseService.broadcast(`store_${ownerId}`, 'chat_requested', { userId, ownerId, targetStaffId, timestamp: new Date() });

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

    sseService.broadcast(userId, 'chat_accepted', { userId, ownerId, staffId: 'system' }); // Or actual staff ID if we had it in context

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

    if (!pendingCall) throw new Error('No pending call found');

    await prisma.chatHistory.update({
      where: { id: pendingCall.id },
      data: {
        // @ts-ignore
        status: 'CALL_DECLINED',
        message: "Sistem: Staff menolak permintaan chat. (System: Staff declined the chat request.)"
      }
    });

    sseService.broadcast(userId, 'chat_declined', { userId, ownerId });

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

  async deleteSession(sessionId, userId) {
    // 1. Verify session belongs to user
    const session = await (prisma).chatSession.findFirst({
      where: { id: sessionId, userId }
    });

    if (!session) throw new Error('Session not found or access denied');

    // 2. Clear session (Cascade delete handles history)
    await (prisma).chatSession.delete({
      where: { id: sessionId }
    });

    return { status: 'success', message: 'Session deleted successfully' };
  }

  async clearUserHistory(userId, ownerId) {
    await (prisma).chatSession.deleteMany({
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

    const onlineUserIds = sseService.getOnlineUserIds();
    const staffWithStatus = staff.map(s => ({
      ...s,
      isOnline: onlineUserIds.includes(s.id)
    }));

    return { status: 'success', staff: staffWithStatus };
  }
}
