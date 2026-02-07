import prisma from '../../prisma.js';

export const getSalesAnalytics = async (period: 'daily' | 'monthly' = 'daily') => {
    const now = new Date();
    let startDate = new Date();

    if (period === 'daily') {
        startDate.setDate(now.getDate() - 7); // Last 7 days
    } else {
        startDate.setMonth(now.getMonth() - 12); // Last 12 months
    }

    const transactions = await prisma.transaction.findMany({
        where: {
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
    const aggregated = transactions.reduce((acc: any, curr) => {
        let key = '';
        if (period === 'daily') {
            key = curr.createdAt.toISOString().split('T')[0];
        } else {
            key = `${curr.createdAt.getFullYear()}-${String(curr.createdAt.getMonth() + 1).padStart(2, '0')}`;
        }

        if (!acc[key]) acc[key] = 0;
        acc[key] += curr.total;
        return acc;
    }, {});

    return Object.entries(aggregated).map(([date, total]) => ({ date, total }));
};

export const getTopSellingProducts = async (limit = 5) => {
    // Since we can't easily group by relation in simple prisma query without raw query or separate aggregation,
    // we'll fetch transaction items and aggregate manually for simplicity in this codebase context,
    // or use groupBy if supported well for relations.
    // Ideally use:
    /*
    const top = await prisma.transactionItem.groupBy({
        by: ['productId'],
        _sum: { quantity: true },
        orderBy: { _sum: { quantity: 'desc' } },
        take: limit
    });
    Then fetch product details.
    */

    const topItems = await prisma.transactionItem.groupBy({
        by: ['productId'],
        _sum: {
            quantity: true,
            price: true // approximations of revenue
        },
        orderBy: {
            _sum: {
                quantity: 'desc'
            }
        },
        take: limit
    });

    const detailedProducts = await Promise.all(
        topItems.map(async (item) => {
            const product = await prisma.product.findUnique({
                where: { id: item.productId },
                select: { name: true, stock: true, price: true, image: true }
            });
            return {
                ...product,
                totalSold: item._sum.quantity,
                totalRevenue: (item._sum.quantity || 0) * (product?.price || 0) // Estimate
            };
        })
    );

    return detailedProducts;
};

export const getStockAlerts = async (threshold = 10) => {
    return await prisma.product.findMany({
        where: {
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
