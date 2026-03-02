import prisma from '../../common/services/prisma.service.js';

export const getSalesAnalytics = async (ownerId: string, period: 'daily' | 'monthly' = 'daily', contributorId?: string) => {
    const now = new Date();
    let startDate = new Date();

    if (period === 'daily') {
        startDate.setDate(now.getDate() - 30); // Last 30 days
        startDate.setHours(0, 0, 0, 0);
    } else {
        startDate.setMonth(now.getMonth() - 12); // Last 12 months
        startDate.setDate(1);
        startDate.setHours(0, 0, 0, 0);
    }

    const transactions = await prisma.transaction.findMany({
        where: {
            ownerId,
            createdAt: { gte: startDate },
            ...(contributorId ? {
                items: {
                    some: {
                        product: { contributorId }
                    }
                }
            } : {})
        } as any,
        include: { items: { include: { product: true } } }
    });

    // Aggregate data
    const aggregated = transactions.reduce((acc: any, curr) => {
        let key = '';
        if (period === 'daily') {
            key = curr.createdAt.toLocaleDateString('sv-SE');
        } else {
            key = `${curr.createdAt.getFullYear()}-${String(curr.createdAt.getMonth() + 1).padStart(2, '0')}`;
        }

        if (!acc[key]) acc[key] = { total: 0, profit: 0 };

        curr.items.forEach((item: any) => {
            const isRelevant = !contributorId || item.product.contributorId === contributorId;
            if (isRelevant) {
                const itemRevenue = Number(item.price) * item.quantity;
                const itemCost = Number(item.product.purchasePrice || 0) * item.quantity;
                acc[key].total += itemRevenue;
                acc[key].profit += (itemRevenue - itemCost);
            }
        });

        return acc;
    }, {});

    // Zero-filling logic
    const results: { date: string, total: number, profit: number }[] = [];
    const iterDate = new Date(startDate);

    while (iterDate <= now) {
        let key = '';
        if (period === 'daily') {
            key = iterDate.toLocaleDateString('sv-SE');
            results.push({
                date: key,
                total: aggregated[key]?.total || 0,
                profit: aggregated[key]?.profit || 0
            });
            iterDate.setDate(iterDate.getDate() + 1);
        } else {
            key = `${iterDate.getFullYear()}-${String(iterDate.getMonth() + 1).padStart(2, '0')}`;
            results.push({
                date: key,
                total: aggregated[key]?.total || 0,
                profit: aggregated[key]?.profit || 0
            });
            iterDate.setMonth(iterDate.getMonth() + 1);
        }
    }

    return results;
};

export const getComprehensiveReport = async (ownerId: string, startDate?: string, endDate?: string, contributorId?: string) => {
    const start = startDate ? new Date(startDate) : new Date(new Date().setDate(new Date().getDate() - 30)); // Default 30 days
    const end = endDate ? new Date(endDate) : new Date();

    const transactions = await prisma.transaction.findMany({
        where: {
            ownerId,
            createdAt: {
                gte: start,
                lte: end
            },
            ...(contributorId ? {
                items: {
                    some: {
                        product: { contributorId }
                    }
                }
            } : {})
        } as any,
        include: {
            items: {
                include: {
                    product: true
                }
            },
            member: true
        }
    });

    const typedTransactions = transactions as any[];

    // 1. Sales Summary (Total, AOV, Member Distribution)
    const totalRevenue = typedTransactions.reduce((sum, tx) => sum + tx.total, 0);
    const transactionCount = typedTransactions.length;
    const avgOrderValue = transactionCount > 0 ? totalRevenue / transactionCount : 0;
    const memberTransactions = typedTransactions.filter(tx => tx.memberId).length;
    const guestTransactions = transactionCount - memberTransactions;

    // 2. Payment Breakdown
    const paymentBreakdown = typedTransactions.reduce((acc: any, tx) => {
        const method = tx.paymentMethod || 'UNKNOWN';
        if (!acc[method]) acc[method] = { method, count: 0, total: 0 };
        acc[method].count += 1;
        acc[method].total += tx.total;
        return acc;
    }, {});

    // 3. Category Breakdown
    const categoryBreakdown = typedTransactions.reduce((acc: any, tx) => {
        tx.items.forEach((item: any) => {
            const cat = item.product?.category || 'Uncategorized';
            if (!acc[cat]) acc[cat] = { category: cat, quantity: 0, revenue: 0 };
            acc[cat].quantity += item.quantity;
            acc[cat].revenue += (item.price * item.quantity);
        });
        return acc;
    }, {});

    // 4. Profit Summary
    const totalProfit = typedTransactions.reduce((sum, tx) => {
        const txProfit = tx.items.reduce((pSum: number, item: any) => {
            const itemRevenue = item.price * item.quantity;
            const itemCost = (item.product?.purchasePrice || 0) * item.quantity;
            return pSum + (itemRevenue - itemCost);
        }, 0);
        return sum + txProfit;
    }, 0);

    return {
        summary: {
            totalRevenue,
            totalProfit,
            transactionCount,
            avgOrderValue,
            memberTransactions,
            guestTransactions,
            loyaltyRate: transactionCount > 0 ? (memberTransactions / transactionCount) * 100 : 0
        },
        payments: Object.values(paymentBreakdown),
        categories: Object.values(categoryBreakdown).sort((a: any, b: any) => b.revenue - a.revenue)
    };
};

export const getTopSellingProducts = async (ownerId: string, limit = 5, contributorId?: string) => {
    const topProducts = await prisma.transactionItem.groupBy({
        by: ['productId'],
        where: {
            transaction: { ownerId },
            ...(contributorId ? { product: { contributorId } } : {})
        } as any,
        _sum: {
            quantity: true,
            price: true,
        },
        orderBy: {
            _sum: {
                quantity: 'desc',
            },
        },
        take: 5,
    });

    return Promise.all(topProducts.map(async (item) => {
        const product = await prisma.product.findUnique({
            where: { id: item.productId },
            select: { name: true },
        });

        return {
            name: product?.name || 'Unknown',
            sales: item._sum?.quantity || 0,
            revenue: Number(item._sum?.price || 0),
        };
    }));
};

export const getStockAlerts = async (ownerId: string, threshold = 10, contributorId?: string) => {
    return prisma.product.findMany({
        where: {
            owner_id: ownerId,
            ...(contributorId ? { contributorId } : {}),
            stock: { lte: 10 },
        } as any,
        select: {
            id: true,
            name: true,
            stock: true,
            category: true,
        },
        orderBy: {
            stock: 'asc',
        },
        take: 10,
    });
};
