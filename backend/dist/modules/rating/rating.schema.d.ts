import { z } from 'zod';
export declare const CreateRatingSchema: z.ZodObject<{
    body: z.ZodObject<{
        ownerId: z.ZodString;
        score: z.ZodNumber;
        feedback: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
}, z.core.$strip>;
export type CreateRatingInput = z.infer<typeof CreateRatingSchema>['body'];
//# sourceMappingURL=rating.schema.d.ts.map