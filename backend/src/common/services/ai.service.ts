import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';

dotenv.config();

export class AIService {
  private static genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
  private static model = this.genAI.getGenerativeModel({ model: "gemini-flash-latest" });

  static async generateChatResponse(message: string, context: string): Promise<string> {
    if (!process.env.GEMINI_API_KEY) {
      return "AI service is currently unavailable. (Missing API Key)";
    }

    try {
      const prompt = `You are HEART v.1, a helpful shopping assistant. 
      Always be bilingual (Indonesian and English). 
      Keep responses conversational and helpful.
      
      CRITICAL: If "Products found" are listed below, you MUST use their specific details like Name, Price, and Aisle/Section location to answer the user's questions accurately.
      If the user asks for prices or locations, look exactly at the provided list.
      
      CONTEXT (DATABASE SEARCH RESULTS):
      ${context}

      USER MESSAGE:
      ${message}`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Gemini Service Error:', error);
      return "Maaf, terjadi kendala saat menghubungi AI. (Sorry, there was an issue contacting the AI.)";
    }
  }
}
