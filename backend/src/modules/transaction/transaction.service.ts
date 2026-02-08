import prisma from '../../common/services/prisma.service.js';

export const createTransaction = async (data: any, cashierId: string) => {
    const { total, discount, paymentMethod, memberId, items, pointsToRedeem } = data;

    return await prisma.$transaction(async (tx) => {
        const settings = await tx.pOSSetting.findUnique({ where: { id: 'global' } });
        let finalDiscount = parseFloat(discount || 0);

        // 1. Handle member points redemption if requested
        if (memberId && pointsToRedeem && pointsToRedeem > 0) {
            const member = await tx.user.findUnique({ where: { id: memberId } });
            if (!member || member.points < pointsToRedeem) {
                throw new Error('Member not found or insufficient points');
            }

            const redeemValue = settings?.pointRedeemVal || 1000;
            const pointDiscount = pointsToRedeem * redeemValue;
            finalDiscount += pointDiscount;

            // Deduct points
            await tx.user.update({
                where: { id: memberId },
                data: { points: { decrement: pointsToRedeem } }
            });

            // Log point history
            await tx.pointHistory.create({
                data: {
                    memberId,
                    amount: pointsToRedeem,
                    type: 'SPEND',
                    description: `Redeemed for transaction discount`
                }
            });
        }

        // 0. Get cashier info for ownerId
        const cashier = await tx.user.findUnique({ where: { id: cashierId } });
        if (!cashier || !cashier.ownerId) throw new Error('Cashier must be associated with a store');

        // 2. Create the transaction header
        const newTransaction = await tx.transaction.create({
            data: {
                ownerId: cashier.ownerId,
                total: parseFloat(total),
                discount: finalDiscount,
                paymentMethod,
                memberId: memberId || null,
                cashierId,
                items: {
                    create: items.map((item: any) => ({
                        productId: item.productId,
                        quantity: parseInt(item.quantity),
                        price: parseFloat(item.price)
                    }))
                }
            },
            include: { items: true }
        });

        // 3. Update product stocks
        for (const item of items) {
            await tx.product.update({
                where: { id: item.productId },
                data: { stock: { decrement: parseInt(item.quantity) } }
            });
        }

        // 4. Handle member points earning
        if (memberId) {
            const minSpend = settings?.pointMinSpend || 10000;
            const ratio = settings?.pointRatio || 5000;

            if (parseFloat(total) >= minSpend) {
                const pointsEarned = Math.floor(parseFloat(total) / ratio);
                if (pointsEarned > 0) {
                    await tx.user.update({
                        where: { id: memberId },
                        data: { points: { increment: pointsEarned } }
                    });

                    await tx.pointHistory.create({
                        data: {
                            memberId,
                            amount: pointsEarned,
                            type: 'EARN',
                            description: `Earned from transaction ${newTransaction.id.slice(0, 8)}`
                        }
                    });
                }
            }
        }

        return newTransaction;
    });
};

export const getTransactions = async (filters: any) => {
    const { startDate, endDate, memberId } = filters;
    return await prisma.transaction.findMany({
        where: {
            AND: [
                memberId ? { memberId } : {},
                startDate && endDate ? {
                    createdAt: {
                        gte: new Date(startDate),
                        lte: new Date(endDate)
                    }
                } : {}
            ]
        },
        include: {
            member: { select: { name: true, phone: true } },
            cashier: { select: { name: true } },
            items: { include: { product: { select: { name: true } } } }
        },
        orderBy: { createdAt: 'desc' }
    });
};

export const getTransactionById = async (id: string) => {
    return await prisma.transaction.findUnique({
        where: { id },
        include: {
            member: true,
            cashier: { select: { name: true } },
            items: { include: { product: true } }
        }
    });
};
