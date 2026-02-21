import type { Request, Response } from 'express';
import { RatingService } from './rating.service.js';

const ratingService = new RatingService();

export class RatingController {
    /**
     * POST /api/rating
     * Create a new rating (User role only)
     */
    async createRating(req: Request, res: Response) {
        try {
            const result = await ratingService.createRating(req.user?.id || null, req.body);
            return res.json(result);
        } catch (error) {
            console.error('Create Rating Controller Error:', error);
            return res.status(400).json({
                status: 'error',
                message: error instanceof Error ? error.message : 'Failed to create rating'
            });
        }
    }
}
