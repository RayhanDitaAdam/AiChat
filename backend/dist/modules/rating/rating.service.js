import { prisma } from '../../common/services/prisma.service.js';
export class RatingService {
    /**
     * Create a new rating (User role)
     */
    async createRating(userId, input) {
        // Verify owner exists
        const owner = await prisma.owner.findUnique({
            where: { id: input.ownerId },
        });
        if (!owner) {
            throw new Error('Owner not found');
        }
        // Create rating
        const rating = await prisma.rating.create({
            data: {
                user_id: userId,
                owner_id: input.ownerId,
                score: input.score,
                feedback: input.feedback || null,
            },
        });
        return {
            status: 'success',
            message: 'Rating submitted successfully',
            rating: {
                id: rating.id,
                score: rating.score,
                feedback: rating.feedback,
            },
        };
    }
}
//# sourceMappingURL=rating.service.js.map