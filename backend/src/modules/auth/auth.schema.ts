import { z } from 'zod';

export const GoogleTokenSchema = z.object({
    body: z.object({
        token: z.string().min(1, 'Google token is required'),
    }),
});

export type GoogleTokenInput = z.infer<typeof GoogleTokenSchema>;
