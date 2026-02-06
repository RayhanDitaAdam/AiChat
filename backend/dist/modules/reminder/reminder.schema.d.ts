import { z } from 'zod';
export declare const CreateReminderSchema: z.ZodObject<{
    body: z.ZodObject<{
        product: z.ZodString;
        remindDate: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
export type CreateReminderInput = z.infer<typeof CreateReminderSchema>['body'];
//# sourceMappingURL=reminder.schema.d.ts.map