/**
 * LOYALTY ENGINE (Alfamart/Indomaret Style)
 *
 * Logic flow:
 * Identify -> Attach -> Accumulate -> Evaluate -> Redeem
 */
export declare class LoyaltyEngine {
    /**
     * STAGE 1: IDENTIFY
     * Lookup member by various identifiers (phone, email, barcode, etc.)
     */
    static identifyMember(identifier: string): Promise<{
        name: string | null;
        id: string;
        ownerId: string | null;
        qrCode: string | null;
        phone: string | null;
        points: number;
    } | null>;
    /**
     * STAGE 3 & 4: ACCUMULATE & EVALUATE
     * Calculates points and evaluates potential rewards/tiers
     */
    static processTransactionLoyalty(tx: any, transactionId: string, memberId: string, total: number, ownerId: string): Promise<{
        pointsEarned: number;
        ledgerId: any;
        voucher: any;
    } | null>;
    /**
     * STAGE 5: REDEEM
     * Validate and deduct points
     */
    static validateRedemption(tx: any, memberId: string, pointsToRedeem: number, ownerId: string): Promise<{
        isValid: boolean;
        discountAmount: number;
    }>;
}
//# sourceMappingURL=loyalty.engine.d.ts.map