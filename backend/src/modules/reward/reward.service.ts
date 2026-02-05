import { prisma } from '../../common/services/prisma.service.js';
import type { IssueRewardInput, QRTransactionRewardInput } from './reward.schema.js';

export class RewardService {
    async issueReward(ownerId: string, data: IssueRewardInput) {
        // Enforce that the user belongs to this owner's store
        const user = await prisma.user.findFirst({
            where: { id: data.userId, memberOfId: ownerId }
        });

        if (!user) {
            throw new Error('Member not found in your store');
        }

        const transaction = await prisma.$transaction([
            (prisma as any).rewardActivity.create({
                data: {
                    userId: data.userId,
                    amount: data.amount,
                    description: data.description,
                    type: data.type
                }
            }),
            prisma.user.update({
                where: { id: data.userId },
                data: {
                    loyaltyPoints: {
                        increment: data.type === 'EARN' ? data.amount : -data.amount
                    }
                }
            })
        ]);

        return {
            status: 'success',
            message: `Reward ${data.type.toLowerCase()}ed successfully`,
            transaction: transaction[0],
            newBalance: transaction[1].loyaltyPoints
        };
    }

    /**
     * Issue reward based on QR scan and transaction value tiers
     * e.g. 100k-200k = X points, 200k-300k = Y points
     */
    async processQRTransaction(ownerId: string, data: QRTransactionRewardInput) {
        const user = await prisma.user.findFirst({
            where: { qrCode: data.memberQrCode, memberOfId: ownerId }
        });

        if (!user) {
            throw new Error('Member with this QR code not found in your store');
        }

        // Tier logic as requested: 100k-200k, 200k-300k, etc.
        let rewardPoints = 0;
        const val = data.transactionValue;

        if (val >= 100000 && val < 200000) rewardPoints = 10;
        else if (val >= 200000 && val < 300000) rewardPoints = 25;
        else if (val >= 300000 && val < 500000) rewardPoints = 50;
        else if (val >= 500000) rewardPoints = 100;

        if (rewardPoints === 0) {
            throw new Error('Transaction value below reward threshold');
        }

        const transaction = await prisma.$transaction([
            (prisma as any).rewardActivity.create({
                data: {
                    userId: user.id,
                    amount: rewardPoints,
                    description: `Reward for transaction of ${val}`,
                    type: 'EARN'
                }
            }),
            prisma.user.update({
                where: { id: user.id },
                data: {
                    loyaltyPoints: { increment: rewardPoints }
                }
            })
        ]);

        return {
            status: 'success',
            message: `Issued ${rewardPoints} points for transaction of ${val}`,
            points: rewardPoints,
            user: {
                name: user.name,
                newBalance: transaction[1].loyaltyPoints
            }
        };
    }

    async getMemberActivities(userId: string) {
        const activities = await (prisma as any).rewardActivity.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        });

        return { status: 'success', activities };
    }
}
