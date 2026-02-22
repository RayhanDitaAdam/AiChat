import { GoogleGenerativeAI } from "@google/generative-ai";
import prisma from "./prisma.service.js";
import dotenv from 'dotenv';
import crypto from 'crypto';
dotenv.config();
export class AIService {
    static modelCache = new Map();
    static async getModel(ownerId, config) {
        try {
            const systemConfig = config || await prisma.systemConfig.findUnique({ where: { id: 'global' } });
            const apiKey = systemConfig?.geminiApiKey || process.env.GEMINI_API_KEY;
            if (!apiKey)
                return null;
            const cacheKey = `${apiKey}_${systemConfig?.aiTemperature}_${systemConfig?.aiMaxTokens}_${systemConfig?.stopSequences?.join(',')}`;
            if (this.modelCache.has(cacheKey)) {
                return this.modelCache.get(cacheKey);
            }
            const genAI = new GoogleGenerativeAI(apiKey);
            const generationConfig = {
                temperature: systemConfig?.aiTemperature ?? 0.7,
                topP: systemConfig?.aiTopP ?? 1.0,
                maxOutputTokens: systemConfig?.aiMaxTokens ?? 1024,
            };
            if (systemConfig?.stopSequences) {
                generationConfig.stopSequences = systemConfig.stopSequences;
            }
            const model = genAI.getGenerativeModel({
                model: "gemini-flash-latest",
                generationConfig
            });
            this.modelCache.set(cacheKey, model);
            return model;
        }
        catch (err) {
            console.error('[AIService] Failed to init model:', err);
            return null;
        }
    }
    static generateHash(text) {
        return crypto.createHash('sha256').update(text).digest('hex');
    }
    static handleAIError(error, language = 'id') {
        const is429 = error?.status === 429 || (typeof error?.message === 'string' && (error.message.includes('429') || error.message.toLowerCase().includes('quota') || error.message.toLowerCase().includes('too many requests')));
        if (is429) {
            return language === 'en'
                ? "Sorry, the AI assistant is currently busy. Please try again in a moment! 🙏"
                : "Waduh bre, AI-nya lagi sibuk banget nih. Coba lagi bentar ya! 🙏";
        }
        console.error('[AIService] Unhandled AI error:', error.message || error);
        return language === 'en'
            ? "Sorry, there was a problem connecting to the AI. Please try again."
            : "Maaf, ada kendala teknis saat menghubungi AI. Coba lagi ya bre!";
    }
    static async getCachedResponse(ownerId, query, language) {
        try {
            const queryHash = this.generateHash(query);
            const cached = await prisma.aICache.findUnique({
                where: {
                    ownerId_queryHash_language: {
                        ownerId: ownerId || null,
                        queryHash,
                        language
                    }
                }
            });
            return cached ? cached.response : null;
        }
        catch (err) {
            console.error('[AIService] Cache lookup error:', err);
            return null;
        }
    }
    static async saveToCache(ownerId, query, response, language) {
        try {
            const queryHash = this.generateHash(query);
            await prisma.aICache.upsert({
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
        }
        catch (err) {
            console.error('[AIService] Cache save error:', err);
        }
    }
    static async generateChatResponse(message, context, language = 'id', systemPrompt, history = [], category = 'RETAIL', ownerId, role = 'REG', config) {
        const model = await this.getModel(ownerId, config);
        if (!model) {
            return "AI service is currently unavailable. (Missing API Key)";
        }
        let prompt = "";
        try {
            const languageInstruction = language === 'en' ? "Respond exclusively in English." : "Respond exclusively in Indonesian.";
            const systemConfig = config || await prisma.systemConfig.findUnique({ where: { id: 'global' } });
            const aiTone = systemConfig?.aiTone || 'HELPFUL';
            const aiSystemPrompt = systemConfig?.aiSystemPrompt || null;
            let businessPersona = "You are HEART v.1, a smart and friendly shopping assistant.";
            let goalText = "GOAL: Help the user find what they need.";
            if (aiTone === 'AGGRESSIVE') {
                businessPersona = "You are HEART v.1, a proactive sales assistant.";
                goalText = "GOAL: Drive sales suggestedly.";
            }
            else if (aiTone === 'PROFESSIONAL') {
                businessPersona = "You are HEART v.1, a formal corporate assistant.";
                goalText = "GOAL: Provide direct assistance.";
            }
            else if (aiTone === 'FRIENDLY') {
                businessPersona = "You are HEART v.1, your super friendly helper!";
                goalText = "GOAL: Help with enthusiasm.";
            }
            if (category === 'HOTEL') {
                businessPersona = "You are HEART v.1, a professional Hotel Concierge.";
                goalText = "GOAL: Help guests with room info.";
            }
            else if (category === 'SERVICE') {
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
            if (cached)
                return cached;
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
        }
        catch (error) {
            console.error('Gemini Service Error:', error);
            if (prompt)
                console.error('Prompt attempted:', prompt.substring(0, 500) + '...');
            return this.handleAIError(error, language);
        }
    }
    static async generateChatResponseStream(message, context, language = 'id', systemPrompt, history = [], category = 'RETAIL', ownerId, role = 'REG', config, onChunk) {
        const model = await this.getModel(ownerId, config);
        if (!model)
            return "AI service unavailable.";
        try {
            const languageInstruction = language === 'en' ? "Respond exclusively in English." : "Respond exclusively in Indonesian.";
            const systemConfig = config || await prisma.systemConfig.findUnique({ where: { id: 'global' } });
            const systemInstruction = systemConfig?.aiSystemPrompt || systemPrompt || "You are HEART v.1, a smart assistant.";
            const historyContext = history.map(h => ({ role: h.role === 'user' ? 'USER' : 'AI', content: h.message }));
            const aiInput = { r: role, m: message, c: category || "GEN", ctx: context, h: historyContext.slice(-5) };
            const inputStr = JSON.stringify(aiInput);
            // Cache check
            const cached = await this.getCachedResponse(ownerId, inputStr, language);
            if (cached) {
                if (onChunk)
                    onChunk(cached);
                return cached;
            }
            const prompt = `${systemInstruction}
${languageInstruction}

STRICT INST:
1. IF r="QST": Sapa dengan ramah dan bantu user. Jawaban harus natural, lengkap, dan tidak terpotong.
2. IF r="REG": MODE=FULL. Personalized svc.
3. TAGS: [FOUND], [NOT_FOUND], [GENERAL] (Keep at start if possible, otherwise inside text)

IN (JSON):
${inputStr}

AI:`;
            const result = await model.generateContentStream(prompt);
            let fullText = "";
            for await (const chunk of result.stream) {
                const chunkText = chunk.text();
                fullText += chunkText;
                if (onChunk)
                    onChunk(chunkText);
            }
            // Save to cache
            await this.saveToCache(ownerId, inputStr, fullText, language);
            return fullText;
        }
        catch (error) {
            console.error('Gemini Stream Error:', error);
            return this.handleAIError(error, language);
        }
    }
    static async generateGuestResponseStream(message, context, language = 'id', systemPrompt, config, onChunk) {
        const guestConfig = {
            ...config,
            aiMaxTokens: 250,
            aiTemperature: 0.7,
            aiTopP: 1.0,
            // Removed stopSequences to prevent accidental cut-offs
        };
        const model = await this.getModel(undefined, guestConfig);
        if (!model)
            return "AI service unavailable.";
        try {
            const languageInstruction = language === 'en' ? "Respond in English." : "Respond in Indonesian.";
            // Natural & Helpful Guest Instruction
            const systemInstruction = systemPrompt || "Sapa user dengan ramah dan tawarkan bantuan. Berikan jawaban yang natural, informatif, dan tidak kaku. Pastikan kalimatmu selesai sepenuhnya.";
            const aiInput = { r: "QST", m: message, c: "GEN", ctx: context };
            const inputStr = JSON.stringify(aiInput);
            // Cache check for Guest
            const cached = await this.getCachedResponse(undefined, inputStr, language);
            if (cached) {
                if (onChunk)
                    onChunk(cached);
                return cached;
            }
            const prompt = `${systemInstruction}
${languageInstruction}

Role: Guest Concierge. 
1. Bersikaplah ramah dan membantu (Friendly Concierge).
2. Jawaban harus natural dan lengkap sampai selesai.
3. NO weather talk.

IN (JSON):
${inputStr}

AI:`;
            const result = await model.generateContentStream(prompt);
            let fullText = "";
            for await (const chunk of result.stream) {
                const chunkText = chunk.text();
                fullText += chunkText;
                if (onChunk)
                    onChunk(chunkText);
            }
            // Save to cache for Guest
            await this.saveToCache(undefined, inputStr, fullText, language);
            return fullText;
        }
        catch (error) {
            console.error('Gemini Guest Stream Error:', error);
            return this.handleAIError(error, language);
        }
    }
    static async generateGuestResponse(message, context, language = 'id', systemPrompt, config) {
        return this.generateGuestResponseStream(message, context, language, systemPrompt, config);
    }
    static async generateManagementResponse(message, context, userRole, config) {
        const model = await this.getModel(undefined, config);
        if (!model)
            return "AI service unavailable.";
        try {
            const systemInstruction = `You are the AI Management Assistant. Role: ${userRole}.`;
            const aiInput = { role: "MGMT", m: message, c: "ANALYSIS", ctx: context };
            const prompt = `${systemInstruction}
Analyze the store data accurately and be professional.

IN (JSON):
${JSON.stringify(aiInput)}

AI:`;
            const result = await model.generateContent(prompt);
            const response = await result.response;
            return response.text();
        }
        catch (error) {
            console.error('Gemini Mgmt Error:', error);
            return this.handleAIError(error);
        }
    }
}
//# sourceMappingURL=ai.service.js.map