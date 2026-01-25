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
}
