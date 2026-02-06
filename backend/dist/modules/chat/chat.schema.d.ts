import { z } from 'zod';
export declare const ChatSchema: z.ZodObject<{
    body: z.ZodObject<{
        message: z.ZodString;
        ownerId: z.ZodString;
        userId: z.ZodString;
        sessionId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        latitude: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        longitude: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    }, z.core.$strip>;
}, z.core.$strip>;
export type ChatInput = z.infer<typeof ChatSchema>['body'];
//# sourceMappingURL=chat.schema.d.ts.map