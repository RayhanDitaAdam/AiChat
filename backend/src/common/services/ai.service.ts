import { GoogleGenerativeAI } from "@google/generative-ai";
import prisma from "../services/prisma.service.js";
import dotenv from 'dotenv';

dotenv.config();

export class AIService {
  static async getModel() {
    // 1. Fetch from DB
    const config = await (prisma as any).systemConfig.findUnique({ where: { id: 'global' } });
    const apiKey = config?.geminiApiKey || process.env.GEMINI_API_KEY;

    if (!apiKey) return null;

    const genAI = new GoogleGenerativeAI(apiKey);
    return genAI.getGenerativeModel({ model: "gemini-flash-latest" });
  }

  static async generateChatResponse(message: string, context: string, language: string = 'id', systemPrompt?: string, history: any[] = []): Promise<string> {
    const model = await this.getModel();
    if (!model) {
      return "AI service is currently unavailable. (Missing API Key)";
    }

    try {
      const languageInstruction = language === 'en'
        ? "Respond exclusively in English."
        : "Respond exclusively in Indonesian.";

      const systemInstruction = systemPrompt || `You are HEART v.1, a smart and friendly shopping assistant. 
      GOAL: Help the user find what they need and offer great alternatives if the exact item isn't available.`;

      const historyContext = history.length > 0
        ? "SESSION HISTORY:\n" + history.map(h => `${h.role === 'user' ? 'USER' : 'AI'}: ${h.message}`).join('\n')
        : "No previous messages in this session.";

      const prompt = `${systemInstruction}
      ${languageInstruction}

      GOAL: Help the user find what they need and offer great alternatives if the exact item isn't available.

      INSTRUCTIONS:
      1. ONE TOPIC PER SESSION: Keep the conversation focused on the current topic. If the user moves to a new topic, follow their lead, but don't force previous suggestions.
      2. RESPECT REJECTIONS (CRITICAL): If the user says "No", "Ga usah", "Skip", or similar rejections to your proactive suggestions (like drinks/fruit or alternatives), DO NOT offer them again in this session.
      3. PRICING & STOCK: If "Products found" are listed in the CONTEXT, use their details (Name, Price, Aisle, Rak) to answer.
      4. WEATHER PROACTIVITY: If CURRENT WEATHER is HOT (>30°C) and you haven't suggested it yet in this session, proactively ask if they'd like fresh fruit or cold drinks from "Nearby Stores". 
         However, IF THE SESSION HISTORY SHOWS THEY ALREADY REJECTED THIS, DO NOT ASK AGAIN.
      5. PROACTIVE SUGGESTIONS: If the user searches for something (e.g., "Daging Sapi") and you only find similar items (e.g., "Ayam"), acknowledge this and say: "Maaf, stok [Barang A] sedang kosong, tapi kami punya [Barang B] yang mungkin kamu suka."
      6. If NO products are found at all, be apologetic and mention that the request has been recorded for the owner.

      RESPONSE FORMAT:
      Start your response with one of these tags:
      [FOUND] - If you found products in the context that match the user's request.
      [NOT_FOUND] - If the user asked for a product but none were found in the context.
      [GENERAL] - If the user's message is a greeting, small talk, or general question.

      CONTEXT (DATABASE SEARCH RESULTS):
      ${context}

      ${historyContext}

      USER MESSAGE:
      ${message}`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Gemini Service Error:', error);
      return "Maaf, terjadi kendala saat menghubungi AI. (Sorry, there was an issue contacting the AI.)";
    }
  }

  static async generateManagementResponse(message: string, context: string, userRole: string): Promise<string> {
    const model = await this.getModel();
    if (!model) return "AI service unavailable.";

    try {
      const systemInstruction = `You are the AI Management Assistant for AiChat Platform.
      Your role is to help ${userRole}s analyze their store data, products, staff, and rewards.
      
      DATA CONTEXT:
      ${context}

      INSTRUCTIONS:
      1. Use the provided DATA CONTEXT to answer questions accurately.
      2. If asked about "Fast-Moving" products, refer to the forecasting data.
      3. If asked about staff tasks, refer to the facility/maintenance data.
      4. Be professional, concise, and proactive in suggesting business improvements.
      5. If data is missing for a specific query, suggest how the owner can add it.`;

      const prompt = `${systemInstruction}\n\nUSER MESSAGE: ${message}\n\nAI RESPONSE:`;
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Gemini Management Error:', error);
      return "Gagal memproses permintaan analisis AI.";
    }
  }
}
