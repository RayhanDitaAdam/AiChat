import { z } from 'zod';

export const GoogleTokenSchema = z.object({
    body: z.object({
        token: z.string().min(1, 'Google token is required'),
    }),
});

export type GoogleTokenInput = z.infer<typeof GoogleTokenSchema>['body'];

export const UpdateProfileSchema = z.object({
    body: z.object({
        language: z.enum(['id', 'en']).optional(),
        name: z.string().optional(),
        image: z.string().url().optional().or(z.literal('')),
    }),
});

export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>['body'];
