import prisma from '../../../common/services/prisma.service.js';

export class IntentManagerService {

    async getIntents(ownerId: string, search?: string) {
        const where: any = { ownerId };

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

    async createIntent(ownerId: string, data: {
        name: string;
        description?: string;
        keywords: string[];
        actionType: string;
        apiEndpoint?: string;
        responseTpl?: string;
        priority?: number;
    }) {
        return await prisma.intentRule.create({
            data: {
                ownerId,
                ...data
            }
        });
    }

    async updateIntent(id: string, ownerId: string, data: any) {
        return await prisma.intentRule.update({
            where: { id, ownerId },
            data
        });
    }

    async deleteIntent(id: string, ownerId: string) {
        await prisma.intentRule.delete({
            where: { id, ownerId }
        });
        return true;
    }

    /**
     * Quick toggle to disable an intent without deleting it.
     */
    async toggleIntentStatus(id: string, ownerId: string, isActive: boolean) {
        return await prisma.intentRule.update({
            where: { id, ownerId },
            data: { isActive }
        });
    }
}
