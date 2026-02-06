import { z } from 'zod';
export const GoogleTokenSchema = z.object({
    body: z.object({
        token: z.string().min(1, 'Google token is required'),
    }),
});
export const RegisterSchema = z.object({
    body: z.object({
        email: z.string().email('Invalid email address'),
        password: z.string().min(8, 'Password must be at least 8 characters'),
        name: z.string().min(1, 'Name is required'),
        role: z.enum(['USER', 'OWNER']).optional(),
        domain: z.string().regex(/^[a-z0-9-]*$/, 'Domain must be lowercase alphanumeric and hyphens only (slug)').optional(), // This is the "slug" or "business domain"
        storeName: z.string().optional(), // This is the display name of the store
        ownerDomain: z.string().optional(),
        phone: z.string().optional(),
    }).refine((data) => {
        if (data.role === 'OWNER') {
            return !!(data.domain && data.storeName);
        }
        return true;
    }, {
        message: 'Domain and Store Name are required for Owner registration',
        path: ['domain'], // Highlighting domain usually enough, or could use generic error
    }),
});
export const LoginSchema = z.object({
    body: z.object({
        email: z.string().email('Invalid email address'),
        password: z.string().min(1, 'Password is required'),
    }),
});
export const UpdateProfileSchema = z.object({
    body: z.object({
        language: z.enum(['id', 'en']).optional(),
        name: z.string().optional(),
        image: z.string().url().optional().or(z.literal('')),
        avatarVariant: z.string().optional(),
        email: z.string().email('Invalid email address').optional(),
        currentPassword: z.string().optional(),
        password: z.string().min(8, 'Password must be at least 8 characters').optional(),
        domain: z.string().regex(/^[a-z0-9-]*$/, 'Domain must be lowercase alphanumeric and hyphens only (slug)').optional(),
        storeName: z.string().optional(),
        phone: z.string().optional(),
        latitude: z.number().optional(),
        longitude: z.number().optional(),
    }).refine((data) => {
        // If password is being changed, currentPassword is required
        if (data.password && !data.currentPassword) {
            return false;
        }
        return true;
    }, {
        message: 'Current password is required to change password',
        path: ['currentPassword']
    }),
});
//# sourceMappingURL=auth.schema.js.map