import type { Request, Response } from 'express';
import { ChatService } from './chat.service.js';

const chatService = new ChatService();

export class ChatController {
    async handleChat(req: Request, res: Response) {
        try {
            const { guestId, ...rest } = req.body;
            const result = await chatService.processChatMessage({
                ...rest,
                userId: req.user?.id,
                guestId: guestId
            });
            return res.json(result);
        } catch (error) {
            console.error('Chat Controller Error:', error);
            return res.status(500).json({ status: 'error', message: 'Something went wrong with the chat.' });
        }
    }

    async getHistory(req: Request, res: Response) {
        try {
            if (!req.user) {
                return res.status(401).json({ status: 'error', message: 'Unauthorized' });
            }
            const { ownerId } = req.query;
            if (!ownerId) return res.status(400).json({ status: 'error', message: 'Owner ID is required' });

            const result = await chatService.getSessions(req.user.id, ownerId as string);
            return res.json(result);
        } catch (error) {
            console.error('Chat History Controller Error:', error);
            return res.status(500).json({ status: 'error', message: 'Failed to fetch history.' });
        }
    }

    async createSession(req: Request, res: Response) {
        try {
            if (!req.user) return res.status(401).json({ status: 'error', message: 'Unauthorized' });
            const { ownerId } = req.body;
            if (!ownerId) return res.status(400).json({ status: 'error', message: 'Owner ID is required' });

            const result = await chatService.createChatSession(req.user.id, ownerId);
            return res.json(result);
        } catch (error) {
            console.error('Create Session Error:', error);
            return res.status(500).json({ status: 'error', message: 'Failed to create session' });
        }
    }

    async getSessionMessages(req: Request, res: Response) {
        try {
            if (!req.user) return res.status(401).json({ status: 'error', message: 'Unauthorized' });
            const { sessionId } = req.params;
            const result = await chatService.getMessagesBySession(sessionId as string);
            return res.json(result);
        } catch (error) {
            console.error('Get Session Messages Error:', error);
            return res.status(500).json({ status: 'error', message: 'Failed to fetch messages' });
        }
    }

    async callStaff(req: Request, res: Response) {
        try {
            if (!req.user) return res.status(401).json({ status: 'error', message: 'Unauthorized' });
            const { ownerId, latitude, longitude } = req.body;
            if (!ownerId) return res.status(400).json({ status: 'error', message: 'Owner ID is required' });

            const result = await chatService.requestStaff(req.user.id, ownerId, latitude, longitude);
            return res.json(result);
        } catch (error) {
            console.error('Call Staff Error:', error);
            return res.status(500).json({ status: 'error', message: 'Failed to call staff' });
        }
    }

    async stopStaff(req: Request, res: Response) {
        try {
            if (!req.user) return res.status(401).json({ status: 'error', message: 'Unauthorized' });
            const { ownerId, duration } = req.body;
            if (!ownerId) return res.status(400).json({ status: 'error', message: 'Owner ID is required' });

            const result = await chatService.stopStaffSupport(req.user.id, ownerId, duration);
            return res.json(result);
        } catch (error) {
            console.error('Stop Staff Error:', error);
            return res.status(500).json({ status: 'error', message: 'Failed to stop staff support' });
        }
    }

    async acceptCall(req: Request, res: Response) {
        try {
            if (!req.user?.ownerId) return res.status(403).json({ status: 'error', message: 'Forbidden' });
            const { userId } = req.body;
            if (!userId) return res.status(400).json({ status: 'error', message: 'User ID is required' });

            const result = await chatService.acceptCall(userId, req.user.ownerId);
            return res.json(result);
        } catch (error) {
            console.error('Accept Call Error:', error);
            return res.status(500).json({ status: 'error', message: error instanceof Error ? error.message : 'Failed to accept call' });
        }
    }

    async declineCall(req: Request, res: Response) {
        try {
            if (!req.user?.ownerId) return res.status(403).json({ status: 'error', message: 'Forbidden' });
            const { userId } = req.body;
            if (!userId) return res.status(400).json({ status: 'error', message: 'User ID is required' });

            const result = await chatService.declineCall(userId, req.user.ownerId);
            return res.json(result);
        } catch (error) {
            console.error('Decline Call Error:', error);
            return res.status(500).json({ status: 'error', message: error instanceof Error ? error.message : 'Failed to decline call' });
        }
    }

    async deleteSession(req: Request, res: Response) {
        try {
            if (!req.user) return res.status(401).json({ status: 'error', message: 'Unauthorized' });
            const { sessionId } = req.params;
            if (!sessionId) return res.status(400).json({ status: 'error', message: 'Session ID is required' });
            const result = await chatService.deleteSession(sessionId as string, req.user.id);
            return res.json(result);
        } catch (error) {
            console.error('Delete Session Error:', error);
            return res.status(500).json({ status: 'error', message: error instanceof Error ? error.message : 'Failed to delete session' });
        }
    }

    async clearHistory(req: Request, res: Response) {
        try {
            if (!req.user) return res.status(401).json({ status: 'error', message: 'Unauthorized' });
            const { ownerId } = req.body;
            if (!ownerId) return res.status(400).json({ status: 'error', message: 'Owner ID is required' });

            const result = await chatService.clearUserHistory(req.user.id, ownerId);
            return res.json(result);
        } catch (error) {
            console.error('Clear History Error:', error);
            return res.status(500).json({ status: 'error', message: 'Failed to clear chat history' });
        }
    }
}
