import { PrismaClient } from '@prisma/client';
import prisma from '../../common/services/prisma.service.js';

/**
 * LOYALTY ENGINE (Alfamart/Indomaret Style)
 * 
 * Logic flow:
 * Identify -> Attach -> Accumulate -> Evaluate -> Redeem
 */

export class LoyaltyEngine {
    /**
     * STAGE 1: IDENTIFY
     * Lookup member by various identifiers (phone, email, barcode, etc.)
     */
    static async identifyMember(identifier: string) {
        return await prisma.user.findFirst({
            where: {
                OR: [
                    { phone: identifier },
                    { email: identifier },
                    { username: identifier },
                    { customerId: identifier },
                    { qrCode: identifier }
                ],
                role: 'USER' // Only customers/members can be processed
            },
            select: {
                id: true,
                name: true,
                phone: true,
                points: true,
                ownerId: true,
                qrCode: true
            }
        });
    }

    /**
     * STAGE 3 & 4: ACCUMULATE & EVALUATE
     * Calculates points and evaluates potential rewards/tiers
     */
    static async processTransactionLoyalty(tx: any, transactionId: string, memberId: string, total: number, ownerId: string) {
        // Get store-specific POS settings
        const settings = await tx.pOSSetting.findUnique({ where: { ownerId } });
        if (!settings) return null;

        const minSpend = settings.pointMinSpend || 10000;
        const ratio = settings.pointRatio || 5000;
        const fridayMultiplier = settings.pointFridayMultiplier || 1;
        const expiryDays = settings.pointExpiryDays || 365;

        if (total < minSpend) return null;

        let pointsEarned = Math.floor(total / ratio);

        // Friday Bonus Multiplier
        const today = new Date();
        if (today.getDay() === 5 && fridayMultiplier > 1) { // 5 is Friday
            pointsEarned *= fridayMultiplier;
        }

        if (pointsEarned <= 0) return null;

        // Calculate Expiry
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + expiryDays);

        // ACCUMULATE: Update member balance
        await tx.user.update({
            where: { id: memberId },
            data: { points: { increment: pointsEarned } }
        });

        // LEDGER: Create point history
        const entry = await tx.pointHistory.create({
            data: {
                memberId,
                amount: pointsEarned,
                type: 'EARN',
                description: `Transaction ${transactionId.slice(0, 8)} | Total: Rp${total.toLocaleString()}${today.getDay() === 5 ? ' (Friday Bonus!)' : ''}`,
                expiresAt
            }
        });

        return {
            pointsEarned,
            ledgerId: entry.id,
            expiresAt
        };
    }

    /**
     * STAGE 5: REDEEM
     * Validate and deduct points
     */
    static async validateRedemption(tx: any, memberId: string, pointsToRedeem: number, totalTransaction: number, ownerId: string) {
        const settings = await tx.pOSSetting.findUnique({ where: { ownerId } });
        if (!settings) throw new Error('POS settings not found');

        const minRedeem = settings.pointMinRedeem || 0;
        const maxPercent = settings.pointMaxUsagePercent || 100;
        const redeemValue = settings.pointRedeemVal || 1000;

        // 1. Check minimum redemption
        if (pointsToRedeem < minRedeem) {
            throw new Error(`Minimum points to redeem is ${minRedeem}`);
        }

        // 2. Check maximum usage percentage
        const discountAmount = pointsToRedeem * redeemValue;
        const maxDiscountAllowed = (totalTransaction * maxPercent) / 100;

        if (discountAmount > maxDiscountAllowed) {
            const maxPointsAllowed = Math.floor(maxDiscountAllowed / redeemValue);
            throw new Error(`Max discount allowed is ${maxPercent}% of total (Rp${maxDiscountAllowed.toLocaleString()}). Max points: ${maxPointsAllowed}`);
        }

        // 3. Check member's unexpired points balance
        const now = new Date();
        const PointHistory = await tx.pointHistory.findMany({
            where: {
                memberId,
                OR: [
                    { expiresAt: { gt: now } }, // Unexpired earnings
                    { type: 'SPEND' }            // All spends (to subtract from total)
                ]
            }
        });

        const unexpiredBalance = PointHistory.reduce((acc: number, curr: any) => acc + curr.amount, 0);

        if (unexpiredBalance < pointsToRedeem) {
            throw new Error(`Insufficient unexpired points. Available: ${unexpiredBalance}`);
        }

        return {
            isValid: true,
            discountAmount
        };
    }

    /**
     * Award Registration Bonus
     */
    static async awardRegistrationBonus(tx: any, memberId: string, ownerId: string) {
        const settings = await tx.pOSSetting.findUnique({ where: { ownerId } });
        if (!settings || !settings.pointBonusRegistration) return;

        const bonus = settings.pointBonusRegistration;
        const expiryDays = settings.pointExpiryDays || 365;

        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + expiryDays);

        await tx.user.update({
            where: { id: memberId },
            data: { points: { increment: bonus } }
        });

        await tx.pointHistory.create({
            data: {
                memberId,
                amount: bonus,
                type: 'EARN',
                description: 'Registration Bonus',
                expiresAt
            }
        });
    }

    /**
     * Award Birthday Bonus (should be triggered by a cron jobs or login event)
     */
    static async awardBirthdayBonus(tx: any, memberId: string, ownerId: string) {
        const settings = await tx.pOSSetting.findUnique({ where: { ownerId } });
        if (!settings || !settings.pointBonusBirthday) return;

        const bonus = settings.pointBonusBirthday;
        const expiryDays = settings.pointExpiryDays || 365;

        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + expiryDays);

        await tx.user.update({
            where: { id: memberId },
            data: { points: { increment: bonus } }
        });

        await tx.pointHistory.create({
            data: {
                memberId,
                amount: bonus,
                type: 'EARN',
                description: 'Birthday Bonus 🎂',
                expiresAt
            }
        });
    }
}
