import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import prisma from "./prisma.service.js";
import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config();

export class AIService {
  private static modelCache: Map<string, any> = new Map();

  static async getModel(ownerId?: string, config?: any) {
    try {
      const systemConfig = config || await (prisma as any).systemConfig.findUnique({ where: { id: 'global' } });
      const apiKey = systemConfig?.geminiApiKey || process.env.GEMINI_API_KEY;

      if (!apiKey) return null;

      const cacheKey = `${apiKey}_${systemConfig?.aiTemperature}_${systemConfig?.aiMaxTokens}_${systemConfig?.stopSequences?.join(',')}_${systemConfig?.aiModel}`;
      if (this.modelCache.has(cacheKey)) {
        return this.modelCache.get(cacheKey);
      }

      const genAI = new GoogleGenerativeAI(apiKey);

      const generationConfig: any = {
        temperature: systemConfig?.aiTemperature ?? 0.7,
        topP: systemConfig?.aiTopP ?? 1.0,
        maxOutputTokens: systemConfig?.aiMaxTokens ?? 1024,
      };

      if (systemConfig?.stopSequences) {
        generationConfig.stopSequences = systemConfig.stopSequences;
      }

      const safetySettings = [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
      ];

      const model = genAI.getGenerativeModel({
        model: systemConfig?.aiModel || "gemini-flash-latest",
        generationConfig,
        safetySettings
      });

      this.modelCache.set(cacheKey, model);
      return model;
    } catch (err) {
      console.error('[AIService] Failed to init model:', err);
      return null;
    }
  }

  private static generateHash(text: string): string {
    return crypto.createHash('sha256').update(text).digest('hex');
  }

  private static handleAIError(error: any, language: string = 'id'): string {
    const isBusy = error?.status === 429 || error?.status === 503 ||
      (typeof error?.message === 'string' && (
        error.message.includes('429') ||
        error.message.includes('503') ||
        error.message.toLowerCase().includes('quota') ||
        error.message.toLowerCase().includes('too many requests') ||
        error.message.toLowerCase().includes('service unavailable') ||
        error.message.toLowerCase().includes('high demand')
      ));

    if (isBusy) {
      return language === 'en'
        ? "Sorry, the AI assistant is currently experiencing high demand. Please try again in a moment! 🙏"
        : "Waduh bre, AI-nya lagi rame banget nih (overload). Coba lagi bentar ya! 🙏";
    }
    console.error('[AIService] Unhandled AI error:', error.message || error);
    return language === 'en'
      ? "Sorry, there was a problem connecting to the AI. Please try again."
      : "Maaf, ada kendala teknis saat menghubungi AI. Coba lagi ya bre!";
  }

  private static async getCachedResponse(ownerId: string | undefined, query: string, language: string): Promise<string | null> {
    try {
      const queryHash = this.generateHash(query);
      const cached = await (prisma as any).aICache.findUnique({
        where: {
          ownerId_queryHash_language: {
            ownerId: ownerId || null,
            queryHash,
            language
          }
        }
      });
      return cached ? cached.response : null;
    } catch (err) {
      console.error('[AIService] Cache lookup error:', err);
      return null;
    }
  }

  private static async saveToCache(ownerId: string | undefined, query: string, response: string, language: string) {
    try {
      const queryHash = this.generateHash(query);
      await (prisma as any).aICache.upsert({
        where: {
          ownerId_queryHash_language: {
            ownerId: ownerId || null,
            queryHash,
            language
          }
        },
        update: { response, updatedAt: new Date() },
        create: {
          ownerId: ownerId || null,
          query,
          queryHash,
          response,
          language
        }
      });
    } catch (err) {
      console.error('[AIService] Cache save error:', err);
    }
  }

  static async generateChatResponse(message: string, context: string, language: string = 'id', systemPrompt?: string, history: any[] = [], category: string = 'RETAIL', ownerId?: string, role: string = 'REG', config?: any): Promise<string> {
    const model = await this.getModel(ownerId, config);
    if (!model) {
      return "AI service is currently unavailable. (Missing API Key)";
    }

    let prompt = "";
    try {
      const languageInstruction = language === 'en' ? "Respond exclusively in English." : "Respond exclusively in Indonesian.";
      const systemConfig = config || await (prisma as any).systemConfig.findUnique({ where: { id: 'global' } });

      const aiTone = systemConfig?.aiTone || 'HELPFUL';
      const aiSystemPrompt = systemConfig?.aiSystemPrompt || null;

      let businessPersona = "You are HEART v.1, a smart and friendly shopping assistant.";
      let goalText = "GOAL: Help the user find what they need.";

      if (aiTone === 'AGGRESSIVE') {
        businessPersona = "You are HEART v.1, a proactive sales assistant.";
        goalText = "GOAL: Drive sales suggestedly.";
      } else if (aiTone === 'PROFESSIONAL') {
        businessPersona = "You are HEART v.1, a formal corporate assistant.";
        goalText = "GOAL: Provide direct assistance.";
      } else if (aiTone === 'FRIENDLY') {
        businessPersona = "You are HEART v.1, your super friendly helper!";
        goalText = "GOAL: Help with enthusiasm.";
      }

      if (category === 'HOTEL') {
        businessPersona = "You are HEART v.1, a professional Hotel Concierge.";
        goalText = "GOAL: Help guests with room info.";
      } else if (category === 'SERVICE') {
        businessPersona = "You are HEART v.1, a Service Support Assistant.";
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

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const responseText = response.text();

      // Save to cache
      await this.saveToCache(ownerId, inputStr, responseText, language);

      return responseText;
    } catch (error: any) {
      console.error('Gemini Service Error:', error);
      if (prompt) console.error('Prompt attempted:', prompt.substring(0, 500) + '...');
      return this.handleAIError(error, language);
    }
  }

  static async generateChatResponseStream(message: string, context: string, language: string = 'id', systemPrompt?: string, history: any[] = [], category: string = 'RETAIL', ownerId?: string, role: string = 'REG', config?: any, onChunk?: (text: string) => void): Promise<string> {
    const model = await this.getModel(ownerId, config);
    if (!model) return "AI service unavailable.";

    try {
      const languageInstruction = language === 'en' ? "Respond exclusively in English." : "Respond exclusively in Indonesian.";
      const systemConfig = config || await (prisma as any).systemConfig.findUnique({ where: { id: 'global' } });
      const systemInstruction = systemPrompt || systemConfig?.aiSystemPrompt || "You are HEART v.1, a smart assistant.";

      const aiInput = { r: role, m: message, ctx: context, h: history.slice(-5), s: systemInstruction, tokens: systemConfig?.aiMaxTokens };
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
4. If USER ROLE is "QST": Be HEART, a friendly store assistant. Help guests with products.
5. If USER ROLE is "REG": Be HEART, providing personalized service.
6. If USER ROLE is "MGMT" or message is about SOP/DOCS: YOU ARE Heart-MGMT, the Company Management Assistant. Provide COMPLETE, DETAILED summaries. NEVER truncate or cut off mid-sentence.
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

      while (attempts <= maxRetries) {
        try {
          const result = await model.generateContentStream(prompt);
          let fullText = "";
          for await (const chunk of result.stream) {
            const chunkText = chunk.text();
            fullText += chunkText;
            if (onChunk) onChunk(chunkText);
          }

          // Save to cache
          await this.saveToCache(ownerId, inputStr, fullText, language);

          return fullText;
        } catch (error: any) {
          const isTransient = error?.status === 429 || error?.status === 503 ||
            (typeof error?.message === 'string' && (error.message.includes('503') || error.message.includes('429')));

          if (isTransient && attempts < maxRetries) {
            attempts++;
            console.log(`[AIService] Transient error (${error.status || '503'}), retrying... Attempt ${attempts}`);
            await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2s before retry
            continue;
          }
          throw error;
        }
      }
      return "AI Busy"; // Should not reach here
    } catch (error: any) {
      console.error('Gemini Stream Error:', error);
      return this.handleAIError(error, language);
    }
  }

  static async generateGuestResponseStream(message: string, context: string, language: string = 'id', systemPrompt?: string, config?: any, onChunk?: (text: string) => void, history: any[] = []): Promise<string> {
    const guestConfig = {
      ...config,
      aiTemperature: 0.7,
      aiTopP: 1.0
    };

    const model = await this.getModel(undefined, guestConfig);
    if (!model) return "AI service unavailable.";

    try {
      const languageInstruction = language === 'en' ? "Respond in English." : "Respond in Indonesian.";
      const systemInstruction = systemPrompt || "Greet user and offer help. Natural and informative.";
      const historyStr = history.slice(-5).map(h => `${h.role === 'user' ? 'USER' : 'AI'}: ${h.message}`).join('\n');

      const aiInput = { r: "QST", m: message, c: "GEN", ctx: context, h: history.slice(-5), s: systemInstruction, tokens: guestConfig?.aiMaxTokens };
      const inputStr = JSON.stringify(aiInput);

      // Cache check
      const cached = await this.getCachedResponse(undefined, inputStr, language);
      if (cached) {
        if (onChunk) onChunk(cached);
        return cached;
      }

      const roleInstruction = (systemInstruction.includes('Heart-MGMT') || systemInstruction.includes('Management'))
        ? `Role: Heart-MGMT, Company Management Assistant. 
           1. MANDATORY: Start EVERY response with exactly ONE tag: [SOP], [GENERAL], or [NAVIGATE: SOP].
           2. NEVER greet as "HEART" or a shopping assistant.
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

      while (attempts <= maxRetries) {
        try {
          const result = await model.generateContentStream(prompt);
          let fullText = "";
          for await (const chunk of result.stream) {
            const chunkText = chunk.text();
            fullText += chunkText;
            if (onChunk) onChunk(chunkText);
          }

          // Save to cache
          await this.saveToCache(undefined, inputStr, fullText, language);

          return fullText;
        } catch (error: any) {
          const isTransient = error?.status === 429 || error?.status === 503 ||
            (typeof error?.message === 'string' && (error.message.includes('503') || error.message.includes('429')));

          if (isTransient && attempts < maxRetries) {
            attempts++;
            console.log(`[AIService] Transient Guest error (${error.status || '503'}), retrying... Attempt ${attempts}`);
            await new Promise(resolve => setTimeout(resolve, 2000));
            continue;
          }
          throw error;
        }
      }
      return "AI Busy";
    } catch (error: any) {
      console.error('Gemini Guest Stream Error:', error);
      return this.handleAIError(error, language);
    }
  }

  static async generateGuestResponse(message: string, context: string, language: string = 'id', systemPrompt?: string, config?: any): Promise<string> {
    return this.generateGuestResponseStream(message, context, language, systemPrompt, config);
  }

  static async generateManagementResponse(message: string, context: string, userRole: string, config?: any): Promise<string> {
    const model = await this.getModel(undefined, config);
    if (!model) return "AI service unavailable.";

    try {
      const systemInstruction = `You are Heart-MGMT, the Company Management Assistant. Role: ${userRole}.
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

      while (attempts <= maxRetries) {
        try {
          const result = await model.generateContent(prompt);
          const response = await result.response;
          return response.text();
        } catch (error: any) {
          const isTransient = error?.status === 429 || error?.status === 503 ||
            (typeof error?.message === 'string' && (error.message.includes('503') || error.message.includes('429')));

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
    } catch (error: any) {
      console.error('Gemini Mgmt Error:', error);
      return this.handleAIError(error);
    }
  }
}
