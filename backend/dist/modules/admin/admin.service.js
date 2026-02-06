import prisma from '../../common/services/prisma.service.js';
export class AdminService {
    async getStats() {
        const p = prisma;
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
        return prisma.missingRequest.findMany({
            include: {
                owner: {
                    select: { name: true, domain: true }
                }
            },
            orderBy: { count: 'desc' }
        });
    }
    async getOwners() {
        return prisma.owner.findMany({
            include: {
                user: {
                    select: { email: true, name: true }
                },
                config: true
            }
        });
    }
    async approveOwner(ownerId, isApproved) {
        return prisma.owner.update({
            where: { id: ownerId },
            data: { isApproved }
        });
    }
    async updateOwnerConfig(ownerId, config) {
        return prisma.ownerConfig.upsert({
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
        return prisma.systemConfig.upsert({
            where: { id: 'global' },
            create: { id: 'global' },
            update: {}
        });
    }
    async updateSystemConfig(config) {
        return prisma.systemConfig.update({
            where: { id: 'global' },
            data: config
        });
    }
    async getUsers() {
        return prisma.user.findMany({
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
    async updateUserMenus(userId, disabledMenus) {
        return prisma.user.update({
            where: { id: userId },
            data: { disabledMenus }
        });
    }
    async toggleUserBlock(userId, isBlocked) {
        return prisma.user.update({
            where: { id: userId },
            data: { isBlocked }
        });
    }
}
//# sourceMappingURL=admin.service.js.map