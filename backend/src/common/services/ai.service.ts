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

  static async generateChatResponse(message: string, context: string, language: string = 'id', systemPrompt?: string): Promise<string> {
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

      const prompt = `${systemInstruction}
      ${languageInstruction}

      GOAL: Help the user find what they need and offer great alternatives if the exact item isn't available.

      INSTRUCTIONS:
      1. If "Products found" are listed in the CONTEXT, use their details (Name, Price, Aisle, Rak) to answer.
      2. PROACTIVE SUGGESTIONS: If the user searches for something (e.g., "Kol Abece") and you only find similar items (e.g., "Kol Putih" or "Kol Ungu"), acknowledge this and say: "Saya tidak menemukan [Barang A], tapi saya punya [Barang B] yang mungkin kamu suka karena [Alasan: Harga murah/Mirip/Segar]."
      3. BE PERSUASIVE: Don't just list products. Recommend them! (e.g., "Bayam ini lagi seger banget lho, harganya juga cuma 7rb!").
      4. If NO products are found at all, be apologetic and mention that the request has been recorded for the owner.

      RESPONSE FORMAT:
      Start your response with one of these tags:
      [FOUND] - If you found products in the context that match the user's request.
      [NOT_FOUND] - If the user asked for a product but none were found in the context.
      [GENERAL] - If the user's message is a greeting, small talk, or general question not about a specific product.
      
      Example: "[FOUND] Halo! Kami punya kol organik yang segar..."
      Example: "[NOT_FOUND] Maaf, kami belum punya bubuk mesiu..."
      Example: "[GENERAL] Halo! Ada yang bisa saya bantu hari ini?"

      CONTEXT (DATABASE SEARCH RESULTS):
      ${context}

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
}
