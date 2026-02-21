import { z } from 'zod';
export const ChatSchema = z.object({
    body: z.object({
        message: z.string().min(1, 'Message is required'),
        ownerId: z.string().uuid('Invalid Owner ID'),
        userId: z.string().uuid('Invalid User ID').nullable().optional(),
        guestId: z.string().nullable().optional(),
        sessionId: z.union([z.string().uuid(), z.literal('')]).nullable().optional(),
        latitude: z.number().nullable().optional(),
        longitude: z.number().nullable().optional(),
    }),
});
//# sourceMappingURL=chat.schema.js.map