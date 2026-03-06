import prisma from '../../common/services/prisma.service.js';

export const getRewards = async (ownerId: string) => {
    return await prisma.pOSReward.findMany({
        where: { ownerId }
    });
};

export const createReward = async (data: any, ownerId: string) => {
    return await prisma.pOSReward.create({
        data: {
            ...data,
            ownerId
        }
    });
};

export const redeemReward = async (memberId: string, rewardId: string, ownerId: string) => {
    return await prisma.$transaction(async (tx) => {
        const reward = await tx.pOSReward.findFirst({
            where: { id: rewardId, ownerId }
        });
        if (!reward) throw new Error('Reward not found or unauthorized');
        if (reward.stock <= 0) throw new Error('Reward out of stock');

        const member = await tx.user.findUnique({ where: { id: memberId } });
        if (!member || member.points < reward.pointsRequired) {
            throw new Error('Member not found or insufficient points');
        }

        // 1. Deduct points from user
        await tx.user.update({
            where: { id: memberId },
            data: { points: { decrement: reward.pointsRequired } }
        });

        // 2. Deduct stock from reward
        await tx.pOSReward.update({
            where: { id: rewardId },
            data: { stock: { decrement: 1 } }
        });

        // 3. Create point history
        await tx.pointHistory.create({
            data: {
                memberId,
                amount: -reward.pointsRequired, // Negative for spending
                type: 'SPEND',
                description: `Redeemed reward: ${reward.name}`
            }
        });

        return { success: true, rewardName: reward.name };
    });
};
