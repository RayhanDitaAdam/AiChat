import prisma from '../../common/services/prisma.service.js';

export class AdminService {
    async getStats() {
        const p = prisma as any;
        const [userCount, ownerCount, chatCount, productCount] = await Promise.all([
            p.user.count(),
            p.owner.count(),
            p.chatHistory.count({ where: { role: 'user' } }),
            p.product.count()
        ]);

        return {
            users: userCount,
            owners: ownerCount,
            totalChats: chatCount,
            totalProducts: productCount
        };
    }

    async getMissingRequests() {
        return (prisma as any).missingRequest.findMany({
            include: {
                owner: {
                    select: { name: true, domain: true }
                }
            },
            orderBy: { count: 'desc' }
        });
    }

    async getOwners() {
        return (prisma as any).owner.findMany({
            include: {
                user: {
                    select: { id: true, email: true, name: true }
                },
                config: true
            }
        });
    }

    async updateOwnerCategory(ownerId: string, businessCategory: string) {
        return (prisma as any).owner.update({
            where: { id: ownerId },
            data: { businessCategory }
        });
    }

    async approveOwner(ownerId: string, isApproved: boolean) {
        return (prisma as any).owner.update({
            where: { id: ownerId },
            data: { isApproved }
        });
    }

    async updateOwnerConfig(ownerId: string, config: { showInventory?: boolean, showChat?: boolean }) {
        return (prisma as any).ownerConfig.upsert({
            where: { owner_id: ownerId },
            create: {
                owner_id: ownerId,
                showInventory: config.showInventory ?? true,
                showChat: config.showChat ?? true
            },
            update: config
        });
    }

    async getSystemConfig() {
        return (prisma as any).systemConfig.upsert({
            where: { id: 'global' },
            create: { id: 'global' },
            update: {}
        });
    }

    async updateSystemConfig(config: {
        aiSystemPrompt?: string,
        geminiApiKey?: string,
        chatRetentionDays?: number,
        dailyChatLimitUser?: number,
        dailyChatLimitOwner?: number,
        aiTemperature?: number,
        aiTopP?: number,
        aiMaxTokens?: number,
        aiTone?: string

    }) {
        return (prisma as any).systemConfig.update({
            where: { id: 'global' },
            data: config
        });
    }

    async getUsers() {
        return (prisma as any).user.findMany({
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                disabledMenus: true,
                isBlocked: true,
                memberOf: {
                    select: { name: true }
                },
                owner: {
                    select: { name: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    async updateUserMenus(userId: string, disabledMenus: string[]) {
        return (prisma as any).user.update({
            where: { id: userId },
            data: { disabledMenus }
        });
    }

    async toggleUserBlock(userId: string, isBlocked: boolean) {
        return (prisma as any).user.update({
            where: { id: userId },
            data: { isBlocked }
        });
    }
}
