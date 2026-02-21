import type { CreateRatingInput } from './rating.schema.js';
export declare class RatingService {
    /**
     * Create a new rating (User or Guest)
     */
    createRating(userId: string | null, input: CreateRatingInput): Promise<{
        status: string;
        message: string;
        rating: {
            id: string;
            score: number;
            feedback: string | null;
        };
    }>;
}
//# sourceMappingURL=rating.service.d.ts.map