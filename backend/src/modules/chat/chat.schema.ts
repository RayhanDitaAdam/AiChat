import { z } from 'zod';

export const ChatSchema = z.object({
    body: z.object({
        message: z.string().min(1, 'Message is required'),
        ownerId: z.string().uuid('Invalid Owner ID'),
        userId: z.string().uuid('Invalid User ID'),
    }),
});

export type ChatInput = z.infer<typeof ChatSchema>['body'];
