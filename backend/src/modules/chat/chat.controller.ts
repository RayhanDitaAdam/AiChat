import type { Request, Response } from 'express';
import { ChatService } from './chat.service.js';

const chatService = new ChatService();

export class ChatController {
    async handleChat(req: Request, res: Response) {
        try {
            const result = await chatService.processChatMessage(req.body);
            return res.json(result);
        } catch (error) {
            console.error('Chat Controller Error:', error);
            return res.status(500).json({ status: 'error', message: 'Something went wrong with the chat.' });
        }
    }
}
