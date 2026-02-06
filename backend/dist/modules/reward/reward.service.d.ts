import type { IssueRewardInput, QRTransactionRewardInput } from './reward.schema.js';
export declare class RewardService {
    issueReward(ownerId: string, data: IssueRewardInput): Promise<{
        status: string;
        message: string;
        transaction: any;
        newBalance: number;
    }>;
    /**
     * Issue reward based on QR scan and transaction value tiers
     * e.g. 100k-200k = X points, 200k-300k = Y points
     */
    processQRTransaction(ownerId: string, data: QRTransactionRewardInput): Promise<{
        status: string;
        message: string;
        points: number;
        user: {
            name: string | null;
            newBalance: number;
        };
    }>;
    getMemberActivities(userId: string): Promise<{
        status: string;
        activities: any;
    }>;
}
//# sourceMappingURL=reward.service.d.ts.map