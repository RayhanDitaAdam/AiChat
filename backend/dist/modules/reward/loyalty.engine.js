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
    static async identifyMember(identifier) {
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
    static async processTransactionLoyalty(tx, transactionId, memberId, total, ownerId) {
        // Get store-specific POS settings
        const settings = await tx.pOSSetting.findUnique({ where: { ownerId } });
        if (!settings)
            return null;
        const minSpend = settings.pointMinSpend || 10000;
        const ratio = settings.pointRatio || 5000;
        if (total < minSpend)
            return null;
        const pointsEarned = Math.floor(total / ratio);
        if (pointsEarned <= 0)
            return null;
        // ACCUMULATE: Update member balance
        await tx.user.update({
            where: { id: memberId },
            data: { points: { increment: pointsEarned } }
        });
        // LEDGER: Create point history (financial-style)
        const entry = await tx.pointHistory.create({
            data: {
                memberId,
                amount: pointsEarned,
                type: 'EARN',
                description: `Transaction ${transactionId.slice(0, 8)} | Total: Rp${total.toLocaleString()}`
            }
        });
        // EVALUATE: Tiers & Vouchers
        // 1. Check for voucher eligibility (e.g., spent > 500k)
        let voucherGenerated = null;
        if (total >= 500000) {
            const voucherCode = `LVLUP-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
            voucherGenerated = await tx.discountCode.create({
                data: {
                    code: voucherCode,
                    amount: 25000,
                    type: 'FIXED',
                    expiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
                }
            });
            // Log voucher in point history description or separate system
            await tx.pointHistory.update({
                where: { id: entry.id },
                data: { description: `${entry.description} | VOUCHER EARNED: ${voucherCode}` }
            });
        }
        return {
            pointsEarned,
            ledgerId: entry.id,
            voucher: voucherGenerated?.code
        };
    }
    /**
     * STAGE 5: REDEEM
     * Validate and deduct points
     */
    static async validateRedemption(tx, memberId, pointsToRedeem, ownerId) {
        const member = await tx.user.findUnique({
            where: { id: memberId },
            select: { points: true }
        });
        if (!member || member.points < pointsToRedeem) {
            throw new Error('Insufficient points for redemption');
        }
        const settings = await tx.pOSSetting.findUnique({ where: { ownerId } });
        const redeemValue = settings?.pointRedeemVal || 1000;
        const discountAmount = pointsToRedeem * redeemValue;
        return {
            isValid: true,
            discountAmount
        };
    }
}
//# sourceMappingURL=loyalty.engine.js.map