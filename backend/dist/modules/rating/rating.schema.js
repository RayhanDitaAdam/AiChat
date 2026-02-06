import { z } from 'zod';
export const CreateRatingSchema = z.object({
    body: z.object({
        ownerId: z.string().uuid('Invalid owner ID'),
        score: z.number().int().min(1).max(5, 'Score must be between 1 and 5'),
        feedback: z.string().optional(),
    }),
});
//# sourceMappingURL=rating.schema.js.map