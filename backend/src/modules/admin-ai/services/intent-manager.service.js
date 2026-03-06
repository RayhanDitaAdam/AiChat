import prisma from '../../../common/services/prisma.service.js';

export class IntentManagerService {

    async getIntents(ownerId, search) {
        const where = { ownerId };

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
                { keywords: { has: search } }
            ];
        }

        return await prisma.intentRule.findMany({
            where,
            orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }]
        });
    }

    async createIntent(ownerId, data







) {
        return await prisma.intentRule.create({
            data: {
                ownerId,
                ...data
            }
        });
    }

    async updateIntent(id, ownerId, data) {
        return await prisma.intentRule.update({
            where: { id, ownerId },
            data
        });
    }

    async deleteIntent(id, ownerId) {
        await prisma.intentRule.delete({
            where: { id, ownerId }
        });
        return true;
    }

    /**
     * Quick toggle to disable an intent without deleting it.
     */
    async toggleIntentStatus(id, ownerId, isActive) {
        return await prisma.intentRule.update({
            where: { id, ownerId },
            data: { isActive }
        });
    }
}
