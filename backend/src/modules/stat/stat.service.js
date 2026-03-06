import { prisma } from '../../common/services/prisma.service.js';

export class StatService {
    async getGlobalStats() {
        // For Admin
        const [owners, users, products, vacancies] = await Promise.all([
            prisma.owner.count(),
            prisma.user.count({ where: { role: 'USER' } }),
            prisma.product.count(),
            (prisma ).jobVacancy.count()
        ]);

        return {
            status: 'success',
            stats: {
                totalOwners: owners,
                totalUsers: users,
                totalProducts: products,
                totalVacancies: vacancies
            }
        };
    }

    async getOwnerStats(ownerId) {
        // For Owner
        const [members, products, tasks, staff] = await Promise.all([
            prisma.user.count({ where: { memberOfId: ownerId, registrationType: 'MEMBER' } }),
            prisma.product.count({ where: { owner_id: ownerId } }),
            (prisma ).facilityTask.count({ where: { ownerId } }),
            prisma.user.count({ where: { memberOfId: ownerId, role: 'STAFF' } })
        ]);

        const salesIntent = await prisma.shoppingListItem.count({
            where: { product: { owner_id: ownerId } }
        });

        return {
            status: 'success',
            stats: {
                totalMembers: members,
                totalProducts: products,
                totalTasks: tasks,
                totalStaff: staff,
                totalSalesIntent: salesIntent
            }
        };
    }
}
