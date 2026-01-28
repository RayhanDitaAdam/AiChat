import { z } from 'zod';

export const GoogleTokenSchema = z.object({
    body: z.object({
        token: z.string().min(1, 'Google token is required'),
    }),
});

export type GoogleTokenInput = z.infer<typeof GoogleTokenSchema>['body'];

export const RegisterSchema = z.object({
    body: z.object({
        email: z.string().email('Invalid email address'),
        password: z.string().min(8, 'Password must be at least 8 characters'),
        name: z.string().min(1, 'Name is required'),
        role: z.enum(['USER', 'OWNER']).optional(),
        domain: z.string().optional(),
    }).refine((data) => {
        if (data.role === 'OWNER' && !data.domain) {
            return false;
        }
        return true;
    }, {
        message: 'Domain is required for Owner registration',
        path: ['domain'],
    }),
});

export type RegisterInput = z.infer<typeof RegisterSchema>['body'];

export const LoginSchema = z.object({
    body: z.object({
        email: z.string().email('Invalid email address'),
        password: z.string().min(1, 'Password is required'),
    }),
});

export type LoginInput = z.infer<typeof LoginSchema>['body'];

export const UpdateProfileSchema = z.object({
    body: z.object({
        language: z.enum(['id', 'en']).optional(),
        name: z.string().optional(),
        image: z.string().url().optional().or(z.literal('')),
    }),
});

export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>['body'];
