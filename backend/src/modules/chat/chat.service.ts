import prisma from '../../common/services/prisma.service.js';
import { AIService } from '../../common/services/ai.service.js';
import type { ChatInput } from './chat.schema.js';

export class ChatService {
  async processChatMessage(input: ChatInput) {
    const { message, ownerId, userId } = input;

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
      context = "Products found:\n" + products.map((p: any) =>
        `- Name: ${p.name}, Price: ${p.price}, Aisle: ${p.aisle}, Section: ${p.section}, Halal: ${p.halal}`
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

    // 3. Call Gemini with context
    const aiResponse = await AIService.generateChatResponse(message, context);

    // 4. Save to ChatHistory
    await prisma.chatHistory.create({
      data: {
        user_id: userId,
        owner_id: ownerId,
        message: message,
        role: 'user',
      },
    });

    await prisma.chatHistory.create({
      data: {
        user_id: userId,
        owner_id: ownerId,
        message: aiResponse,
        role: 'ai',
      },
    });

    return {
      message: aiResponse,
      products: products.length > 0 ? products : null,
      ratingPrompt: "Gimana bantuan saya? Berikan rating ya! (How was my help? Please give a rating!)"
    };
  }
}
