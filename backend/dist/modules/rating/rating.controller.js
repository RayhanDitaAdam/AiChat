import { RatingService } from './rating.service.js';
const ratingService = new RatingService();
export class RatingController {
    /**
     * POST /api/rating
     * Create a new rating (User role only)
     */
    async createRating(req, res) {
        try {
            if (!req.user) {
                return res.status(401).json({
                    status: 'error',
                    message: 'Authentication required'
                });
            }
            const result = await ratingService.createRating(req.user.id, req.body);
            return res.json(result);
        }
        catch (error) {
            console.error('Create Rating Controller Error:', error);
            return res.status(400).json({
                status: 'error',
                message: error instanceof Error ? error.message : 'Failed to create rating'
            });
        }
    }
}
//# sourceMappingURL=rating.controller.js.map