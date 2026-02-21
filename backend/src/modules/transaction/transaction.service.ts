import prisma from '../../common/services/prisma.service.js';
import { LoyaltyEngine } from '../reward/loyalty.engine.js';

export const createTransaction = async (data: any, cashierId: string) => {
    const { total, discount, paymentMethod, memberId, items, pointsToRedeem } = data;

    return await prisma.$transaction(async (tx) => {
        // 0. Get cashier info for ownerId
        const cashier = await tx.user.findUnique({ where: { id: cashierId } });
        const effectiveStoreId = cashier?.ownerId || cashier?.memberOfId;

        if (!cashier || !effectiveStoreId) throw new Error('Cashier must be associated with a store');

        const ownerId = effectiveStoreId;
        let finalDiscount = parseFloat(discount || 0);

        // 1. STAGE 5: REDEEM (Evaluate & Validate Redemption)
        if (memberId && pointsToRedeem && pointsToRedeem > 0) {
            const redemption = await LoyaltyEngine.validateRedemption(tx, memberId, pointsToRedeem, parseFloat(total), ownerId);
            finalDiscount += redemption.discountAmount;

            // Deduct points (Ledger entry is handled inside LoyaltyEngine for financial style)
            await tx.user.update({
                where: { id: memberId },
                data: { points: { decrement: pointsToRedeem } }
            });

            await tx.pointHistory.create({
                data: {
                    memberId,
                    amount: -pointsToRedeem,
                    type: 'SPEND',
                    description: `Redeemed for transaction discount`
                }
            });
        }

        // 1.5. Validate Stock Availability
        for (const item of items) {
            const product = await tx.product.findUnique({ where: { id: item.productId } });
            if (!product) throw new Error(`Product not found: ${item.productId}`);
            if (product.stock < parseInt(item.quantity)) {
                throw new Error(`Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`);
            }
        }

        // 2. STAGE 2: ATTACH (Create the transaction header and bind member)
        const newTransaction = await tx.transaction.create({
            data: {
                ownerId,
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

        // 3. Update product stocks (Atomic check to prevent race conditions)
        for (const item of items) {
            await tx.product.update({
                where: {
                    id: item.productId,
                    stock: { gte: parseInt(item.quantity) }
                },
                data: { stock: { decrement: parseInt(item.quantity) } }
            });
        }

        // 4. STAGE 3 & 4: ACCUMULATE & EVALUATE
        if (memberId) {
            await LoyaltyEngine.processTransactionLoyalty(
                tx,
                newTransaction.id,
                memberId,
                parseFloat(total),
                ownerId
            );
        }

        return newTransaction;
    });
};

export const getTransactions = async (filters: any) => {
    const { startDate, endDate, memberId, contributorId, ownerId } = filters;
    return await prisma.transaction.findMany({
        where: {
            ownerId, // Security: Always filter by ownerId
            AND: [
                memberId ? { memberId } : {},
                contributorId ? {
                    items: {
                        some: {
                            product: { contributorId }
                        }
                    }
                } : {},
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
            items: {
                ...(contributorId ? { where: { product: { contributorId } } } : {}),
                include: { product: { select: { name: true, contributorId: true } } }
            }
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
