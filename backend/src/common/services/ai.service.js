function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; } async function _asyncOptionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = await fn(value); } else if (op === 'call' || op === 'optionalCall') { value = await fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; } import { GoogleGenAI } from "@google/genai";
import OpenAI from "openai";
import prisma from "./prisma.service.js";
import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config();

export class AIService {
  static __initStatic() { this.modelCache = new Map() }

  static async getModel(ownerId, config) {
    try {
      const globalConfig = await (prisma).systemConfig.findUnique({ where: { id: 'global' } });
      const systemConfig = config ? { ...globalConfig, ...config } : globalConfig;

      const modelName = _optionalChain([systemConfig, 'optionalAccess', _ => _.aiModel]) || "gemini-3-flash-preview";
      const isDeepSeek = modelName.includes('deepseek');

      const apiKey = isDeepSeek ? (_optionalChain([systemConfig, 'optionalAccess', _2 => _2.deepseekApiKey]) || process.env.DEEPSEEK_API_KEY) : (_optionalChain([systemConfig, 'optionalAccess', _3 => _3.geminiApiKey]) || process.env.GEMINI_API_KEY);

      if (!apiKey) {
        console.warn('[AIService] getModel: API Key is missing');
        return null;
      }

      const cacheKey = `${apiKey}_${_optionalChain([systemConfig, 'optionalAccess', _4 => _4.aiTemperature])}_${_optionalChain([systemConfig, 'optionalAccess', _5 => _5.aiMaxTokens])}_${_optionalChain([systemConfig, 'optionalAccess', _6 => _6.stopSequences, 'optionalAccess', _7 => _7.join, 'call', _8 => _8(',')])}_${modelName}`;
      if (this.modelCache.has(cacheKey)) {
        return this.modelCache.get(cacheKey);
      }

      let model;

      if (isDeepSeek) {
        model = new OpenAI({
          baseURL: 'https://api.deepseek.com',
          apiKey: apiKey,
        });
        // attach config
        model.systemConfig = systemConfig;
      } else {
        const client = new GoogleGenAI({ apiKey });

        const generationConfig = {
          temperature: _nullishCoalesce(_optionalChain([systemConfig, 'optionalAccess', _9 => _9.aiTemperature]), () => (0.7)),
          topP: _nullishCoalesce(_optionalChain([systemConfig, 'optionalAccess', _10 => _10.aiTopP]), () => (1.0)),
          maxOutputTokens: _nullishCoalesce(_optionalChain([systemConfig, 'optionalAccess', _11 => _11.aiMaxTokens]), () => (1024)),
        };

        if (_optionalChain([systemConfig, 'optionalAccess', _12 => _12.stopSequences])) {
          generationConfig.stopSequences = systemConfig.stopSequences;
        }

        // The new SDK uses a different structure
        model = {
          client,
          modelName,
          generationConfig,
          systemInstruction: systemConfig.systemPrompt // Store for generateContent calls
        };
      }

      this.modelCache.set(cacheKey, model);
      return model;
    } catch (err) {
      console.error('[AIService] Failed to init model:', err);
      return null;
    }
  }

  static generateHash(text) {
    return crypto.createHash('sha256').update(text).digest('hex');
  }

  static handleAIError(error, language = 'id') {
    const isBusy = _optionalChain([error, 'optionalAccess', _13 => _13.status]) === 429 || _optionalChain([error, 'optionalAccess', _14 => _14.status]) === 503 ||
      (typeof _optionalChain([error, 'optionalAccess', _15 => _15.message]) === 'string' && (
        error.message.includes('429') ||
        error.message.includes('503') ||
        error.message.toLowerCase().includes('quota') ||
        error.message.toLowerCase().includes('too many requests') ||
        error.message.toLowerCase().includes('service unavailable') ||
        error.message.toLowerCase().includes('high demand')
      ));

    if (isBusy) {
      return language === 'en'
        ? "Waduh, the AI is a bit overwhelmed/busy right now (503). Please try again in 5-10 seconds! 🙏"
        : "Wah, AI-nya lagi sibuk banget bre (overload/503). Coba lagi 5-10 detik ya! 🙏";
    }

    if (_optionalChain([error, 'optionalAccess', _16 => _16.status]) === 404) {
      return language === 'en'
        ? "AI model not found (404). Please contact support to check the configuration."
        : "Model AI nggak ketemu bre (404). Coba lapor admin buat cek settingannya!";
    }
    console.error('[AIService] Unhandled AI error:', error.message || error);
    return language === 'en'
      ? "Sorry, there was a problem connecting to the AI. Please try again."
      : "Maaf, ada kendala teknis saat menghubungi AI. Coba lagi ya bre!";
  }

  static async getCachedResponse(ownerId, query, language) {
    try {
      const queryHash = this.generateHash(query);
      const targetOwnerId = ownerId || null;
      const cached = await (prisma).aICache.findFirst({
        where: {
          ownerId: targetOwnerId,
          queryHash,
          language
        }
      });
      return cached ? cached.response : null;
    } catch (err) {
      console.error('[AIService] Cache lookup error:', err);
      return null;
    }
  }

  static async saveToCache(ownerId, query, response, language) {
    try {
      const queryHash = this.generateHash(query);
      const targetOwnerId = ownerId || null;

      const existing = await (prisma).aICache.findFirst({
        where: {
          ownerId: targetOwnerId,
          queryHash,
          language
        }
      });

      if (existing) {
        await (prisma).aICache.update({
          where: { id: existing.id },
          data: { response, updatedAt: new Date() }
        });
      } else {
        await (prisma).aICache.create({
          data: {
            ownerId: targetOwnerId,
            query,
            queryHash,
            response,
            language
          }
        });
      }
    } catch (err) {
      console.error('[AIService] Cache save error:', err);
    }
  }

  static async generateChatResponse(message, context, language = 'id', systemPrompt, history = [], category = 'RETAIL', ownerId, role = 'REG', config) {
    let currentModelName = _optionalChain([config, 'optionalAccess', _ => _.aiModel]) || "gemini-3-flash-preview";
    let model = await this.getModel(ownerId, { ...config, aiModel: currentModelName });
    if (!model) {
      return "AI service is currently unavailable. (Missing API Key)";
    }

    let prompt = "";
    let attempts = 0;
    const maxRetries = 1;

    while (attempts <= maxRetries) {
      try {
        const languageInstruction = language === 'en' ? "Respond exclusively in English." : "Respond exclusively in Indonesian.";
        const systemConfig = config || await (prisma).systemConfig.findUnique({ where: { id: 'global' } });

        const aiTone = _optionalChain([systemConfig, 'optionalAccess', _17 => _17.aiTone]) || 'HELPFUL';
        const aiSystemPrompt = _optionalChain([systemConfig, 'optionalAccess', _18 => _18.aiSystemPrompt]) || null;
        const companyName = _optionalChain([systemConfig, 'optionalAccess', _19 => _19.companyName]) || 'HeartAI';

        let businessPersona = `You are ${companyName} v.1, a smart and friendly shopping assistant.`;

        let goalText = "GOAL: Help the user find what they need.";

        if (aiTone === 'AGGRESSIVE') {
          businessPersona = `You are ${companyName} v.1, a proactive sales assistant.`;
          goalText = "GOAL: Drive sales suggestedly.";
        } else if (aiTone === 'PROFESSIONAL') {
          businessPersona = `You are ${companyName} v.1, a formal corporate assistant.`;
          goalText = "GOAL: Provide direct assistance.";
        } else if (aiTone === 'FRIENDLY') {
          businessPersona = `You are ${companyName} v.1, your super friendly helper!`;
          goalText = "GOAL: Help with enthusiasm.";
        }

        if (category === 'HOTEL') {
          businessPersona = `You are ${companyName} v.1, a professional Hotel Concierge.`;
          goalText = "GOAL: Help guests with room info.";
        } else if (category === 'SERVICE') {
          businessPersona = `You are ${companyName} v.1, a Service Support Assistant.`;
          goalText = "GOAL: Help clients understand pricing.";
        }

        const systemInstruction = aiSystemPrompt || systemPrompt || `${businessPersona} \n${goalText}`;
        const historyContext = history.map(h => ({ role: h.role === 'user' ? 'USER' : 'AI', content: h.message }));

        const aiInput = {
          r: role,
          m: message,
          c: category || "GEN",
          ctx: context,
          h: historyContext.slice(-5) // Take last 5 history items
        };

        const inputStr = JSON.stringify(aiInput);

        // Cache check
        const cached = await this.getCachedResponse(ownerId, inputStr, language);
        if (cached) return cached;

        prompt = `${systemInstruction}
${languageInstruction}

STRICT INST (JSON Schema):
r=Role, m=Msg, c=Cat, ctx=Context, h=History
1. IF r="QST": Sapa dengan ramah dan bantu user. Pastikan jawaban lengkap dan tidak terpotong.
2. IF r="REG": MODE=FULL. Personalized svc.
3. MD_SAFE (REG ONLY): Add [SAFE_IDS: id1, id2...] at end.

TAGS: [FOUND], [NOT_FOUND], [GENERAL]

IN (JSON):
${inputStr}

AI:`;

        const isDeepSeek = (_optionalChain([systemConfig, 'optionalAccess', _20 => _20.aiModel]) || '').includes('deepseek');
        let responseText = "";

        if (isDeepSeek) {
          const completion = await model.chat.completions.create({
            messages: [{ role: "system", content: prompt }],
            model: _optionalChain([systemConfig, 'optionalAccess', _21 => _21.aiModel]) || "deepseek-chat",
            temperature: _nullishCoalesce(_optionalChain([systemConfig, 'optionalAccess', _22 => _22.aiTemperature]), () => (0.7)),
            max_tokens: _nullishCoalesce(_optionalChain([systemConfig, 'optionalAccess', _23 => _23.aiMaxTokens]), () => (1024)),
            top_p: _nullishCoalesce(_optionalChain([systemConfig, 'optionalAccess', _24 => _24.aiTopP]), () => (1.0))
          });
          responseText = completion.choices[0].message.content || "";
        } else {
          const response = await model.client.models.generateContent({
            model: model.modelName,
            contents: prompt,
            config: {
              ...model.generationConfig,
              systemInstruction: model.systemInstruction
            }
          });
          responseText = response.text;
        }

        return responseText;
      } catch (error) {
        const isTransient = _optionalChain([error, 'optionalAccess', _ => _.status]) === 429 || _optionalChain([error, 'optionalAccess', _ => _.status]) === 503 ||
          (typeof _optionalChain([error, 'optionalAccess', _ => _.message]) === 'string' && (error.message.includes('503') || error.message.includes('429')));
        const isNotFound = _optionalChain([error, 'optionalAccess', _ => _.status]) === 404;

        const systemConfig = config || await (prisma).systemConfig.findUnique({ where: { id: 'global' } });
        const isDeepSeek = (_optionalChain([systemConfig, 'optionalAccess', _20 => _20.aiModel]) || '').includes('deepseek');

        if (isNotFound && currentModelName === 'gemini-3-flash-preview' && !isDeepSeek) {
          console.warn(`[AIService] generateChatResponse: Model ${currentModelName} failed (404), falling back to gemini-3-flash-preview...`);
          currentModelName = 'gemini-3-flash-preview';
          model = await this.getModel(ownerId, { ...config, aiModel: currentModelName });
          attempts++;
          continue; // Retry with new model
        }

        if (isTransient && attempts < maxRetries) {
          attempts++;
          console.log(`[AIService] Transient error (${error.status || '503'}), retrying... Attempt ${attempts}`);
          await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1s before retry
          continue;
        }

        console.error('AI Service Error:', error);
        if (prompt) console.error('Prompt attempted:', prompt.substring(0, 500) + '...');
        return this.handleAIError(error, language);
      }
    }
  }

  static async generateChatResponseStream(message, context, language = 'id', systemPrompt, history = [], category = 'RETAIL', ownerId, role = 'REG', config, onChunk) {
    let currentModelName = _optionalChain([config, 'optionalAccess', _ => _.aiModel]) || "gemini-3-flash-preview";
    let model = await this.getModel(ownerId, { ...config, aiModel: currentModelName });
    if (!model) return "AI service unavailable.";

    try {
      const languageInstruction = language === 'en' ? "Respond exclusively in English." : "Respond exclusively in Indonesian.";
      const systemConfig = config || await (prisma).systemConfig.findUnique({ where: { id: 'global' } });
      const companyName = _optionalChain([systemConfig, 'optionalAccess', _25 => _25.companyName]) || 'HeartAI';
      const systemInstruction = systemPrompt || _optionalChain([systemConfig, 'optionalAccess', _26 => _26.aiSystemPrompt]) || `You are ${companyName} v.1, a smart assistant.`;

      const aiInput = { r: role, m: message, ctx: context, h: history.slice(-5), s: systemInstruction, tokens: _optionalChain([systemConfig, 'optionalAccess', _27 => _27.aiMaxTokens]) };
      const inputStr = JSON.stringify(aiInput);
      const historyContext = history.map(h => ({ role: h.role === 'user' ? 'USER' : 'AI', content: h.message }));

      const historyStr = history.slice(-5).map(h => `${h.role === 'user' ? 'USER' : 'AI'}: ${h.message}`).join('\n');

      const prompt = `INSTRUCTIONS:
${systemInstruction}
${languageInstruction}

Stricter Persona Guidelines:
1. ALWAYS respond in the requested language.
2. MANDATORY: Start EVERY response with exactly ONE tag: [FOUND], [NOT_FOUND], [SOP], [GENERAL], or [NAVIGATE: SOP].
3. STOCK AWARENESS: In CTX_PRODS, "S:0" means out of stock. If a product is in context but S:0, say "Stok Habis" or "Exhausted" instead of "Not found".
4. If USER ROLE is "QST": Be ${companyName}, a friendly store assistant. Help guests with products.
5. If USER ROLE is "REG": Be ${companyName}, providing personalized service.
6. If USER ROLE is "MGMT" or message is about SOP/DOCS: YOU ARE ${companyName}-MGMT, the Company Management Assistant. Provide COMPLETE, DETAILED summaries. NEVER truncate or cut off mid-sentence.
7. Use [NAVIGATE: SOP] if the user asks to see/show the full document. Keep the response brief ONLY when a redirect is triggered.

DATA:
- USER ROLE: ${role}
- USER MESSAGE: ${message}
- CATEGORY: ${category || "GENERAL"}
- CONTEXT: ${context}

CONVERSATION HISTORY:
${historyStr || 'None'}

AI Response:`;


      // Cache check
      const cached = await this.getCachedResponse(ownerId, inputStr, language);
      if (cached) {
        if (onChunk) onChunk(cached);
        return cached;
      }

      let attempts = 0;
      const maxRetries = 1;

      const isDeepSeek = (_optionalChain([systemConfig, 'optionalAccess', _28 => _28.aiModel]) || '').includes('deepseek');

      while (attempts <= maxRetries) {
        try {
          let fullText = "";

          if (isDeepSeek) {
            const stream = await model.chat.completions.create({
              messages: [{ role: "system", content: prompt }],
              model: _optionalChain([systemConfig, 'optionalAccess', _29 => _29.aiModel]) || "deepseek-chat",
              temperature: _nullishCoalesce(_optionalChain([systemConfig, 'optionalAccess', _30 => _30.aiTemperature]), () => (0.7)),
              max_tokens: _nullishCoalesce(_optionalChain([systemConfig, 'optionalAccess', _31 => _31.aiMaxTokens]), () => (1024)),
              top_p: _nullishCoalesce(_optionalChain([systemConfig, 'optionalAccess', _32 => _32.aiTopP]), () => (1.0)),
              stream: true,
            });

            for await (const chunk of stream) {
              const chunkText = _optionalChain([chunk, 'access', _33 => _33.choices, 'access', _34 => _34[0], 'optionalAccess', _35 => _35.delta, 'optionalAccess', _36 => _36.content]) || "";
              if (chunkText) {
                fullText += chunkText;
                if (onChunk) onChunk(chunkText);
              }
            }
          } else {
            const result = await model.client.models.generateContentStream({
              model: model.modelName,
              contents: prompt,
              config: {
                ...model.generationConfig,
                systemInstruction: model.systemInstruction
              }
            });
            for await (const chunk of result) {
              const chunkText = chunk.text;
              fullText += chunkText;
              if (onChunk) onChunk(chunkText);
            }
          }

          // Save to cache
          await this.saveToCache(ownerId, inputStr, fullText, language);

          return fullText;
        } catch (error) {
          const isTransient = _optionalChain([error, 'optionalAccess', _37 => _37.status]) === 429 || _optionalChain([error, 'optionalAccess', _38 => _38.status]) === 503 ||
            (typeof _optionalChain([error, 'optionalAccess', _39 => _39.message]) === 'string' && (error.message.includes('503') || error.message.includes('429')));
          const isNotFound = _optionalChain([error, 'optionalAccess', _ => _.status]) === 404;

          if (isNotFound && currentModelName === 'gemini-3-flash-preview' && !isDeepSeek) {
            console.warn(`[AIService] generateChatResponseStream: Model ${currentModelName} failed (404), falling back to gemini-3-flash-preview...`);
            currentModelName = 'gemini-3-flash-preview';
            model = await this.getModel(ownerId, { ...config, aiModel: currentModelName });
            attempts++;
            continue; // Retry with new model
          }

          if (isTransient && attempts < maxRetries) {
            attempts++;
            console.log(`[AIService] Transient error (${error.status || '503'}), retrying... Attempt ${attempts}`);
            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1s before retry
            continue;
          }
          throw error;
        }
      }
      return "AI Busy"; // Should not reach here
    } catch (error) {
      console.error('AI Stream Error:', error);
      const errorMsg = this.handleAIError(error, language);
      if (onChunk) onChunk(errorMsg);
      return errorMsg;
    }
  }

  static async generateGeneralResponseStream(message, language = 'id', systemPrompt, config, onChunk, history = []) {
    let currentModelName = _optionalChain([config, 'optionalAccess', _ => _.aiModel]) || "gemini-3-flash-preview";
    const generalConfig = {
      ...config,
      aiTemperature: 0.7,
      aiTopP: 1.0,
      aiModel: currentModelName
    };

    let model = await this.getModel(undefined, generalConfig);
    if (!model) return "AI service unavailable.";

    try {
      const languageInstruction = language === 'en' ? "Respond in English." : "Respond in Indonesian.";
      const historyStr = history.map(h => `${h.role === 'user' ? 'USER' : 'AI'}: ${h.message}`).join('\n');

      const prompt = `Goal: You are Heart General, a versatile and intelligent AI assistant.
Rules:
1. Provide helpful, accurate, and natural responses.
2. ${languageInstruction}
3. No length restrictions unless requested by the user.

USER MESSAGE: ${message}
CONVERSATION HISTORY:
${historyStr || 'None'}

AI RESPONSE:`;

      let fullText = "";
      const result = await model.client.models.generateContentStream({
        model: model.modelName,
        contents: prompt,
        config: {
          ...model.generationConfig,
          systemInstruction: systemPrompt || "You are a helpful AI assistant."
        }
      });

      for await (const chunk of result) {
        const chunkText = chunk.text;
        fullText += chunkText;
        if (onChunk) onChunk(chunkText);
      }

      return fullText;
    } catch (error) {
      console.error('Gemini General Stream Error:', error);
      const errorMsg = this.handleAIError(error, language);
      if (onChunk) onChunk(errorMsg);
      return errorMsg;
    }
  }

  static async generateGuestResponseStream(message, context, language = 'id', systemPrompt, config, onChunk, history = []) {
    let currentModelName = _optionalChain([config, 'optionalAccess', _ => _.aiModel]) || "gemini-3-flash-preview";
    const guestConfig = {
      ...config,
      aiTemperature: 0.7,
      aiTopP: 1.0,
      aiModel: currentModelName
    };

    let model = await this.getModel(undefined, guestConfig);
    if (!model) return "AI service unavailable.";

    try {
      const languageInstruction = language === 'en' ? "Respond in English." : "Respond in Indonesian.";
      const systemInstruction = systemPrompt || "Greet user and offer help. Natural and informative.";
      const historyStr = history.slice(-5).map(h => `${h.role === 'user' ? 'USER' : 'AI'}: ${h.message}`).join('\n');

      const aiInput = { r: "QST", m: message, c: "GEN", ctx: context, h: history.slice(-5), s: systemInstruction, tokens: _optionalChain([guestConfig, 'optionalAccess', _40 => _40.aiMaxTokens]) };
      const inputStr = JSON.stringify(aiInput);

      // Cache check
      const cached = await this.getCachedResponse(undefined, inputStr, language);
      if (cached) {
        if (onChunk) onChunk(cached);
        return cached;
      }

      const companyName = _optionalChain([guestConfig, 'optionalAccess', _41 => _41.companyName]) || await _asyncOptionalChain([(await (prisma).systemConfig.findUnique({ where: { id: 'global' } })), 'optionalAccess', async _42 => _42.companyName]) || 'HeartAI';
      const roleInstruction = (systemInstruction.includes(`${companyName}-MGMT`) || systemInstruction.includes('Management'))
        ? `Role: ${companyName}-MGMT, Company Management Assistant. 
           1. MANDATORY: Start EVERY response with exactly ONE tag: [SOP], [GENERAL], or [NAVIGATE: SOP].
           2. NEVER greet as "${companyName}" or a shopping assistant.
           3. Focus EXCLUSIVELY on internal policies and data.
           4. Be professional and authoritative.`
        : `Role: Friendly Store Concierge (GUEST). 
           1. MANDATORY: Start EVERY response with exactly ONE tag: [FOUND], [NOT_FOUND], [GENERAL].
           2. STOCK: If product S:0 in context, say "Stok Habis".
           3. Berikan jawaban yang ramah, natural, dan lengkap.
           4. JANGAN memotong kalimat. Selesaikan penjelasan sampai tuntas.
           5. Gunakan data CONTEXT untuk membantu user menemukan produk (Aisle/Rack).`;

      const prompt = `INSTRUCTIONS:
${systemInstruction}
${languageInstruction}

${roleInstruction}

USER MESSAGE: ${message}
CONTEXT: ${context}
CONVERSATION HISTORY:
${historyStr || 'None'}

AI Response:`;

      let attempts = 0;
      const maxRetries = 1;
      const systemConfig = guestConfig || await (prisma).systemConfig.findUnique({ where: { id: 'global' } });
      const isDeepSeek = (_optionalChain([systemConfig, 'optionalAccess', _43 => _43.aiModel]) || '').includes('deepseek');

      while (attempts <= maxRetries) {
        try {
          let fullText = "";

          if (isDeepSeek) {
            const stream = await model.chat.completions.create({
              messages: [{ role: "system", content: prompt }],
              model: _optionalChain([systemConfig, 'optionalAccess', _44 => _44.aiModel]) || "deepseek-chat",
              temperature: _nullishCoalesce(_optionalChain([guestConfig, 'optionalAccess', _45 => _45.aiTemperature]), () => (0.7)),
              max_tokens: _nullishCoalesce(_optionalChain([guestConfig, 'optionalAccess', _46 => _46.aiMaxTokens]), () => (1024)),
              top_p: _nullishCoalesce(_optionalChain([guestConfig, 'optionalAccess', _47 => _47.aiTopP]), () => (1.0)),
              stream: true,
            });

            for await (const chunk of stream) {
              const chunkText = _optionalChain([chunk, 'access', _48 => _48.choices, 'access', _49 => _49[0], 'optionalAccess', _50 => _50.delta, 'optionalAccess', _51 => _51.content]) || "";
              if (chunkText) {
                fullText += chunkText;
                if (onChunk) onChunk(chunkText);
              }
            }
          } else {
            const result = await model.client.models.generateContentStream({
              model: model.modelName,
              contents: prompt,
              config: {
                ...model.generationConfig,
                systemInstruction: model.systemInstruction
              }
            });
            for await (const chunk of result) {
              const chunkText = chunk.text;
              fullText += chunkText;
              if (onChunk) onChunk(chunkText);
            }
          }

          // Save to cache
          await this.saveToCache(undefined, inputStr, fullText, language);

          return fullText;
        } catch (error) {
          const isTransient = _optionalChain([error, 'optionalAccess', _52 => _52.status]) === 429 || _optionalChain([error, 'optionalAccess', _53 => _53.status]) === 503 ||
            (typeof _optionalChain([error, 'optionalAccess', _54 => _54.message]) === 'string' && (error.message.includes('503') || error.message.includes('429')));
          const isNotFound = _optionalChain([error, 'optionalAccess', _ => _.status]) === 404;

          if (isNotFound && currentModelName === 'gemini-3-flash-preview' && !isDeepSeek) {
            console.warn(`[AIService] generateGuestResponseStream: Model ${currentModelName} failed (404), falling back to gemini-3-flash-preview...`);
            currentModelName = 'gemini-3-flash-preview';
            guestConfig.aiModel = currentModelName;
            model = await this.getModel(undefined, guestConfig);
            attempts++;
            continue; // Retry with new model
          }

          if (isTransient && attempts < maxRetries) {
            attempts++;
            console.log(`[AIService] Transient Guest error (${error.status || '503'}), retrying... Attempt ${attempts}`);
            await new Promise(resolve => setTimeout(resolve, 1000));
            continue;
          }
          throw error;
        }
      }
      return "AI Busy";
    } catch (error) {
      console.error('Gemini Guest Stream Error:', error);
      const errorMsg = this.handleAIError(error, language);
      if (onChunk) onChunk(errorMsg);
      return errorMsg;
    }
  }

  static async generateSystemResponse(message, systemPrompt, history = [], config = {}, modelPreference = 'gemini-3-flash-preview', temperature = 0.1) {
    const models = [modelPreference, 'gemini-3-flash-preview'];
    const systemConfig = await (prisma).systemConfig.findUnique({ where: { id: 'global' } });
    const apiKey = _optionalChain([systemConfig, 'optionalAccess', _55 => _55.geminiApiKey]) || process.env.GEMINI_API_KEY || '';

    if (!apiKey) throw new Error('[AIService] API Key missing for system response (check System Configuration)');

    const ai = new GoogleGenAI({ apiKey });
    const formattedHistory = history.map(msg => ({
      role: msg.role === 'ai' ? 'model' : 'user',
      parts: [{ text: msg.message || msg.content || '' }]
    }));

    // The new SDK models.generateContent uses 'user' and 'model' for roles in parts.
    const contents = [...formattedHistory, { role: 'user', parts: [{ text: message }] }];

    for (const modelName of models) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: contents,
          config: {
            systemInstruction: systemPrompt,
            temperature,
            ...config
          }
        });
        return response.text;
      } catch (error) {
        console.warn(`[AIService] Model ${modelName} failed, retrying... Error:`, error.message || error);
        // Fallback continues to the next model in the array
      }
    }

    throw new Error('[AIService] All Gemini models failed for generateSystemResponse');
  }

  static async generateGuestResponse(message, context, language = 'id', systemPrompt, config) {
    return this.generateGuestResponseStream(message, context, language, systemPrompt, config);
  }

  static async generateManagementResponse(message, context, userRole, config) {
    let currentModelName = _optionalChain([config, 'optionalAccess', _ => _.aiModel]) || "gemini-3-flash-preview";
    let model = await this.getModel(undefined, { ...config, aiModel: currentModelName });
    if (!model) return "AI service unavailable.";

    try {
      const companyName = _optionalChain([config, 'optionalAccess', _59 => _59.companyName]) || await _asyncOptionalChain([(await (prisma).systemConfig.findUnique({ where: { id: 'global' } })), 'optionalAccess', async _60 => _60.companyName]) || 'HeartAI';
      const systemInstruction = `You are ${companyName}-MGMT, the Company Management Assistant. Role: ${userRole}.
      Your primary purpose is to analyze internal store data and company SOPs/policies. 
      You are NOT a shopping assistant in this mode. Do not suggest products to customers or discuss shopping unless specifically related to inventory management or manager duties.`;
      const aiInput = { role: "MGMT", m: message, c: "ANALYSIS", ctx: context };

      const prompt = `${systemInstruction}
Analyze the company data and SOP documents accurately. Be professional and authoritative.
PRIORITY RULE: If the user asks about internal rules, procedures, SOPs, or policies, YOU MUST prioritize checking the \`companyDocs\` inside the JSON context.
Quote the exact text or reference the exact document title and section when answering.

IN (JSON):
${JSON.stringify(aiInput)}

AI:`;

      let attempts = 0;
      const maxRetries = 1;
      const isDeepSeek = (_optionalChain([config, 'optionalAccess', _61 => _61.aiModel]) || '').includes('deepseek');

      while (attempts <= maxRetries) {
        try {
          let responseText = "";
          if (isDeepSeek) {
            const completion = await model.chat.completions.create({
              messages: [{ role: "system", content: prompt }],
              model: _optionalChain([config, 'optionalAccess', _62 => _62.aiModel]) || "deepseek-chat",
              temperature: _nullishCoalesce(_optionalChain([config, 'optionalAccess', _63 => _63.aiTemperature]), () => (0.7)),
              max_tokens: _nullishCoalesce(_optionalChain([config, 'optionalAccess', _64 => _64.aiMaxTokens]), () => (1024)),
              top_p: _nullishCoalesce(_optionalChain([config, 'optionalAccess', _65 => _65.aiTopP]), () => (1.0))
            });
            responseText = completion.choices[0].message.content || "";
          } else {
            const response = await model.client.models.generateContent({
              model: model.modelName,
              contents: prompt,
              config: {
                ...model.generationConfig,
                systemInstruction: model.systemInstruction
              }
            });
            responseText = response.text;
          }
          return responseText;
        } catch (error) {
          const isTransient = _optionalChain([error, 'optionalAccess', _66 => _66.status]) === 429 || _optionalChain([error, 'optionalAccess', _67 => _67.status]) === 503 ||
            (typeof _optionalChain([error, 'optionalAccess', _68 => _68.message]) === 'string' && (error.message.includes('503') || error.message.includes('429')));
          const isNotFound = _optionalChain([error, 'optionalAccess', _ => _.status]) === 404;

          if (isNotFound && currentModelName === 'gemini-3-flash-preview' && !isDeepSeek) {
            console.warn(`[AIService] generateManagementResponse: Model ${currentModelName} failed (404), falling back to gemini-3-flash-preview...`);
            currentModelName = 'gemini-3-flash-preview';
            model = await this.getModel(undefined, { ...config, aiModel: currentModelName });
            attempts++;
            continue; // Retry with new model
          }

          if (isTransient && attempts < maxRetries) {
            attempts++;
            console.log(`[AIService] Transient Mgmt error (${error.status || '503'}), retrying... Attempt ${attempts}`);
            await new Promise(resolve => setTimeout(resolve, 2000));
            continue;
          }
          throw error;
        }
      }
      return "AI Busy";
    } catch (error) {
      console.error('AI Mgmt Error:', error);
      return this.handleAIError(error);
    }
  }
} AIService.__initStatic();
