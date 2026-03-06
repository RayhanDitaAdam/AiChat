 function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }
import { RatingService } from './rating.service.js';

const ratingService = new RatingService();

export class RatingController {
    /**
     * POST /api/rating
     * Create a new rating (User role only)
     */
    async createRating(req, res) {
        try {
            const result = await ratingService.createRating(_optionalChain([req, 'access', _ => _.user, 'optionalAccess', _2 => _2.id]) || null, req.body);
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
