import { z } from 'zod';

export const CreateReminderSchema = z.object({
    body: z.object({
        product: z.string().min(1, 'Product name is required'),
        remindDate: z.string().datetime('Invalid datetime format'),
    }),
});

export type CreateReminderInput = z.infer<typeof CreateReminderSchema>;
