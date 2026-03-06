import { z } from 'zod';

export const IssueRewardSchema = z.object({
    body: z.object({
        userId: z.string().uuid(),
        amount: z.number().int().positive(),
        description: z.string().min(1),
        type: z.enum(['EARN', 'SPEND']).default('EARN'),
    }),
});

export const QRTransactionRewardSchema = z.object({
    body: z.object({
        memberQrCode: z.string().min(1),
        transactionValue: z.number().positive(),
    }),
});

export type IssueRewardInput = z.infer<typeof IssueRewardSchema>['body'];
export type QRTransactionRewardInput = z.infer<typeof QRTransactionRewardSchema>['body'];
