import prisma from '../../common/services/prisma.service.js';
export const getSalesAnalytics = async (ownerId, period = 'daily') => {
    const now = new Date();
    let startDate = new Date();
    if (period === 'daily') {
        startDate.setDate(now.getDate() - 7); // Last 7 days
    }
    else {
        startDate.setMonth(now.getMonth() - 12); // Last 12 months
    }
    const transactions = await prisma.transaction.findMany({
        where: {
            ownerId,
            createdAt: {
                gte: startDate
            }
        },
        select: {
            createdAt: true,
            total: true
        }
    });
    // Aggregate data
    const aggregated = transactions.reduce((acc, curr) => {
        let key = '';
        if (period === 'daily') {
            key = curr.createdAt.toISOString().split('T')[0];
        }
        else {
            key = `${curr.createdAt.getFullYear()}-${String(curr.createdAt.getMonth() + 1).padStart(2, '0')}`;
        }
        if (!acc[key])
            acc[key] = 0;
        acc[key] += curr.total;
        return acc;
    }, {});
    return Object.entries(aggregated).map(([date, total]) => ({ date, total }));
};
export const getTopSellingProducts = async (ownerId, limit = 5) => {
    const topItems = await prisma.transactionItem.groupBy({
        by: ['productId'],
        where: {
            transaction: {
                ownerId
            }
        },
        _sum: {
            quantity: true
        },
        orderBy: {
            _sum: {
                quantity: 'desc'
            }
        },
        take: limit
    });
    const detailedProducts = await Promise.all(topItems.map(async (item) => {
        const product = await prisma.product.findUnique({
            where: { id: item.productId },
            select: { name: true, stock: true, price: true, image: true }
        });
        return {
            ...product,
            totalSold: item._sum.quantity,
            totalRevenue: (item._sum.quantity || 0) * (product?.price || 0)
        };
    }));
    return detailedProducts;
};
export const getStockAlerts = async (ownerId, threshold = 10) => {
    return await prisma.product.findMany({
        where: {
            owner_id: ownerId,
            stock: {
                lte: threshold
            }
        },
        select: {
            id: true,
            name: true,
            stock: true,
            image: true,
            category: true
        },
        orderBy: {
            stock: 'asc'
        }
    });
};
//# sourceMappingURL=report.service.js.map