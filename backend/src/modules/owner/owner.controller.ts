import type { Request, Response } from 'express';
import { OwnerService } from './owner.service.js';

const ownerService = new OwnerService();

export class OwnerController {
    /**
     * GET /api/missing-request/:ownerId
     * Get missing product requests for owner (Owner role only)
     */
    async getMissingRequests(req: Request, res: Response) {
        try {
            const ownerId = req.params.ownerId as string;

            if (!ownerId) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Owner ID is required'
                });
            }

            const result = await ownerService.getMissingRequests(ownerId);
            return res.json(result);
        } catch (error) {
            console.error('Get Missing Requests Controller Error:', error);
            return res.status(500).json({
                status: 'error',
                message: error instanceof Error ? error.message : 'Failed to fetch missing requests'
            });
        }
    }

    /**
     * GET /api/ratings/:ownerId
     * Get ratings for owner (Owner role only)
     */
    async getRatings(req: Request, res: Response) {
        try {
            const ownerId = req.params.ownerId as string;

            if (!ownerId) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Owner ID is required'
                });
            }

            const result = await ownerService.getRatings(ownerId);
            return res.json(result);
        } catch (error) {
            console.error('Get Ratings Controller Error:', error);
            return res.status(500).json({
                status: 'error',
                message: error instanceof Error ? error.message : 'Failed to fetch ratings'
            });
        }
    }

    /**
     * GET /api/chat-history/:ownerId
     * Get chat history for owner (Owner role only)
     */
    async getChatHistory(req: Request, res: Response) {
        try {
            const ownerId = req.params.ownerId as string;

            if (!ownerId) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Owner ID is required'
                });
            }

            const result = await ownerService.getChatHistory(ownerId);
            return res.json(result);
        } catch (error) {
            console.error('Get Chat History Controller Error:', error);
            return res.status(500).json({
                status: 'error',
                message: error instanceof Error ? error.message : 'Failed to fetch chat history'
            });
        }
    }

    /**
     * GET /api/public/owners/:domain
     * Get owner details by domain (Public)
     */
    async getPublicOwnerByDomain(req: Request, res: Response) {
        try {
            const domain = req.params.domain as string;

            if (!domain) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Domain is required'
                });
            }

            const result = await ownerService.getOwnerByDomain(domain);
            return res.json(result);
        } catch (error) {
            console.error('Get Public Owner Controller Error:', error);
            return res.status(404).json({
                status: 'error',
                message: error instanceof Error ? error.message : 'Owner not found'
            });
        }
    }
    /**
     * GET /api/owner/live-support
     */
    async getLiveSupportSessions(req: Request, res: Response) {
        try {
            if (!req.user?.ownerId) return res.status(403).json({ status: 'error', message: 'Forbidden' });
            const result = await ownerService.getLiveSupportSessions(req.user.ownerId);
            return res.json(result);
        } catch (error) {
            console.error('Get Live Sessions Error:', error);
            return res.status(500).json({ status: 'error', message: 'Failed to fetch sessions' });
        }
    }

    /**
     * POST /api/owner/live-support/respond
     */
    async respondToChat(req: Request, res: Response) {
        try {
            if (!req.user?.ownerId) return res.status(403).json({ status: 'error', message: 'Forbidden' });
            const { userId, message } = req.body;
            if (!userId || !message) return res.status(400).json({ status: 'error', message: 'Missing fields' });

            const result = await ownerService.respondToChat(req.user.ownerId, userId, message);
            return res.json(result);
        } catch (error) {
            console.error('Respond to Chat Error:', error);
            return res.status(500).json({ status: 'error', message: 'Failed to send response' });
        }
    }

    /**
     * GET /api/owner/live-support/:userId
     */
    async getLiveChatHistory(req: Request, res: Response) {
        try {
            if (!req.user?.ownerId) return res.status(403).json({ status: 'error', message: 'Forbidden' });
            const userId = req.params.userId;
            const since = req.query.since;

            if (typeof userId !== 'string') {
                return res.status(400).json({ status: 'error', message: 'User ID is required' });
            }

            const result = await ownerService.getLiveChatHistory(
                req.user!.ownerId as string,
                userId,
                typeof since === 'string' ? since : undefined
            );
            return res.json(result);
        } catch (error) {
            console.error('Get Live Chat History Error:', error);
            return res.status(500).json({ status: 'error', message: 'Failed to fetch history' });
        }
    }
}
