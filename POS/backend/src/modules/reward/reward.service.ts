import prisma from '../../prisma.js';

export const getRewards = async () => {
    return await prisma.reward.findMany();
};

export const createReward = async (data: any) => {
    return await prisma.reward.create({ data });
};

export const redeemReward = async (memberId: string, rewardId: string) => {
    return await prisma.$transaction(async (tx) => {
        const reward = await tx.reward.findUnique({ where: { id: rewardId } });
        if (!reward) throw new Error('Reward not found');
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
        await tx.reward.update({
            where: { id: rewardId },
            data: { stock: { decrement: 1 } }
        });

        // 3. Create point history
        await tx.pointHistory.create({
            data: {
                memberId,
                amount: reward.pointsRequired,
                type: 'SPEND',
                description: `Redeemed reward: ${reward.name}`
            }
        });

        return { success: true, rewardName: reward.name };
    });
};
