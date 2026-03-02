import prisma from '../../common/services/prisma.service.js';

export class AdminService {
    async getStats(days: number = 7) {
        const p = prisma as any;
        const now = new Date();
        const startDate = new Date();
        startDate.setDate(now.getDate() - days);
        startDate.setHours(0, 0, 0, 0);

        const [userCount, ownerCount, chatCount, productCount, chatHistory] = await Promise.all([
            p.user.count(),
            p.owner.count(),
            p.chatHistory.count({ where: { role: 'user' } }),
            p.product.count(),
            p.chatHistory.findMany({
                where: {
                    role: 'user',
                    timestamp: { gte: startDate }
                },
                select: { timestamp: true }
            })
        ]);

        // Aggregate chats by date
        const chatAggregation = chatHistory.reduce((acc: any, curr: any) => {
            const date = curr.timestamp.toLocaleDateString('sv-SE');
            if (!acc[date]) acc[date] = 0;
            acc[date]++;
            return acc;
        }, {});

        // Fill in zeroes for gaps
        const history: { date: string, count: number }[] = [];
        const iterDate = new Date(startDate);
        while (iterDate <= now) {
            const dateStr = iterDate.toLocaleDateString('sv-SE');
            history.push({
                date: dateStr,
                count: chatAggregation[dateStr] || 0
            });
            iterDate.setDate(iterDate.getDate() + 1);
        }

        return {
            users: userCount,
            owners: ownerCount,
            totalChats: chatCount,
            totalProducts: productCount,
            history
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
        const p = prisma as any;
        const users = await p.user.findMany({
            where: { role: 'OWNER' },
            include: {
                owner: {
                    include: {
                        config: true
                    }
                }
            }
        });

        return users.map((u: any) => {
            if (u.owner) {
                return {
                    ...u.owner,
                    user: {
                        id: u.id,
                        email: u.email,
                        name: u.name,
                        role: u.role,
                        isBlocked: u.isBlocked,
                        image: u.image,
                        avatarVariant: u.avatarVariant
                    }
                };
            }
            return {
                id: u.id, // Use user ID if no owner record
                name: u.name || 'Unnamed Owner',
                domain: 'N/A',
                isApproved: false,
                businessCategory: 'N/A',
                user: {
                    id: u.id,
                    email: u.email,
                    name: u.name,
                    role: u.role,
                    isBlocked: u.isBlocked,
                    image: u.image,
                    avatarVariant: u.avatarVariant
                }
            };
        });
    }

    async updateOwnerCategory(ownerId: string, businessCategory: string) {
        return (prisma as any).owner.update({
            where: { id: ownerId },
            data: { businessCategory }
        });
    }

    async createOwner(data: { name: string, email: string, domain: string, password?: string }) {
        const p = prisma as any;

        // 1. Check if user or domain exists
        const existingUser = await p.user.findUnique({ where: { email: data.email } });
        if (existingUser) throw new Error('User with this email already exists');

        const existingOwner = await p.owner.findUnique({ where: { domain: data.domain } });
        if (existingOwner) throw new Error('Store domain already exists');

        // 2. Setup IDs and Password
        const hashedPassword = await (await import('../../common/utils/password.util.js')).PasswordUtil.hash(data.password || 'heart123');

        // 3. Create User and Owner in transaction
        return p.$transaction(async (tx: any) => {
            const user = await tx.user.create({
                data: {
                    email: data.email,
                    name: data.name,
                    password: hashedPassword,
                    role: 'OWNER',
                    isEmailVerified: true
                }
            });

            const owner = await tx.owner.create({
                data: {
                    name: data.name,
                    domain: data.domain,
                    user: { connect: { id: user.id } }
                }
            });

            await tx.user.update({
                where: { id: user.id },
                data: { ownerId: owner.id }
            });

            return { user, owner };
        });
    }

    async deleteOwner(ownerId: string) {
        const p = prisma as any;

        // Find user associated with this owner to clean up
        const owner = await p.owner.findUnique({
            where: { id: ownerId },
            include: { user: true }
        });

        if (!owner) throw new Error('Owner not found');

        return p.$transaction(async (tx: any) => {
            // Delete associated data first
            await tx.ownerConfig.deleteMany({ where: { owner_id: ownerId } });
            await tx.product.deleteMany({ where: { owner_id: ownerId } });

            // Delete Owner
            await tx.owner.delete({ where: { id: ownerId } });

            // Delete User if exists
            if (owner.user) {
                await tx.user.delete({ where: { id: owner.user.id } });
            }

            return { success: true };
        });
    }

    async updateOwner(ownerId: string, data: { name?: string, domain?: string, isApproved?: boolean, isBlocked?: boolean }) {
        const p = prisma as any;
        const owner = await p.owner.findUnique({
            where: { id: ownerId },
            include: { user: true }
        });

        if (!owner) throw new Error('Owner not found');

        return p.$transaction(async (tx: any) => {
            if (data.name !== undefined || data.domain !== undefined || data.isApproved !== undefined) {
                await tx.owner.update({
                    where: { id: ownerId },
                    data: {
                        ...(data.name !== undefined && { name: data.name }),
                        ...(data.domain !== undefined && { domain: data.domain }),
                        ...(data.isApproved !== undefined && { isApproved: data.isApproved })
                    }
                });
            }

            if (data.isBlocked !== undefined && owner.user) {
                await tx.user.update({
                    where: { id: owner.user.id },
                    data: { isBlocked: data.isBlocked }
                });
            }

            return { success: true };
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
        aiTone?: string,
        aiModel?: string
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

    async getAdmins() {
        return (prisma as any).user.findMany({
            where: { role: 'ADMIN' },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                createdAt: true,
                isBlocked: true
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    async deleteAdmin(userId: string, superAdminId: string, ipAddress: string) {
        // Enforce that only ADMIN role can be deleted via this method
        const user = await (prisma as any).user.findUnique({
            where: { id: userId },
            select: { role: true }
        });

        if (!user || user.role !== 'ADMIN') {
            throw new Error('Only ADMIN accounts can be removed by Super Admin');
        }

        const p = prisma as any;
        return p.$transaction(async (tx: any) => {
            // Log first while user exists to satisfy foreign key constraint
            await tx.auditLog.create({
                data: {
                    superAdminId,
                    targetAdminId: userId,
                    action: 'DELETE_ADMIN',
                    ipAddress,
                    details: { id: userId } // We'll fetch basic info before delete if needed, or just ID
                }
            });

            const deletedUser = await tx.user.delete({
                where: { id: userId }
            });

            return deletedUser;
        });
    }

    async createAdmin(data: { email: string, name: string, password?: string }, superAdminId: string, ipAddress: string) {
        const p = prisma as any;
        const hashedPassword = await (await import('../../common/utils/password.util.js')).PasswordUtil.hash(data.password || 'admin123');

        return p.$transaction(async (tx: any) => {
            const newAdmin = await tx.user.create({
                data: {
                    email: data.email,
                    name: data.name,
                    password: hashedPassword,
                    role: 'ADMIN',
                    isEmailVerified: true
                }
            });

            await tx.auditLog.create({
                data: {
                    superAdminId,
                    targetAdminId: newAdmin.id,
                    action: 'CREATE_ADMIN',
                    ipAddress,
                    details: { email: newAdmin.email, name: newAdmin.name }
                }
            });

            return newAdmin;
        });
    }

    async updateAdmin(userId: string, data: { name?: string, email?: string, isBlocked?: boolean }, superAdminId: string, ipAddress: string) {
        const p = prisma as any;
        const user = await p.user.findUnique({
            where: { id: userId },
            select: { role: true }
        });

        if (!user || user.role !== 'ADMIN') {
            throw new Error('Only ADMIN accounts can be updated via this action');
        }

        return p.$transaction(async (tx: any) => {
            const updatedAdmin = await tx.user.update({
                where: { id: userId },
                data: {
                    ...(data.name !== undefined && { name: data.name }),
                    ...(data.email !== undefined && { email: data.email }),
                    ...(data.isBlocked !== undefined && { isBlocked: data.isBlocked })
                }
            });

            await tx.auditLog.create({
                data: {
                    superAdminId,
                    targetAdminId: userId,
                    action: 'UPDATE_ADMIN',
                    ipAddress,
                    details: data
                }
            });

            return updatedAdmin;
        });
    }
}
