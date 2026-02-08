import { z } from 'zod';
export declare const IssueRewardSchema: z.ZodObject<{
    body: z.ZodObject<{
        userId: z.ZodString;
        amount: z.ZodNumber;
        description: z.ZodString;
        type: z.ZodDefault<z.ZodEnum<{
            SPEND: "SPEND";
            EARN: "EARN";
        }>>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const QRTransactionRewardSchema: z.ZodObject<{
    body: z.ZodObject<{
        memberQrCode: z.ZodString;
        transactionValue: z.ZodNumber;
    }, z.core.$strip>;
}, z.core.$strip>;
export type IssueRewardInput = z.infer<typeof IssueRewardSchema>['body'];
export type QRTransactionRewardInput = z.infer<typeof QRTransactionRewardSchema>['body'];
//# sourceMappingURL=reward.schema.d.ts.map