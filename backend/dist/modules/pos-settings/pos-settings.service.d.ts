export declare const getSettings: () => Promise<{
    id: string;
    ownerId: string;
    phone: string | null;
    storeName: string;
    address: string | null;
    pointMinSpend: number;
    pointRatio: number;
    pointRedeemVal: number;
    pointBonusBirthday: number;
    pointBonusRegistration: number;
    pointExpiryDays: number;
    pointFridayMultiplier: number;
    pointMaxUsagePercent: number;
    pointMinRedeem: number;
} | null>;
export declare const updateSettings: (data: any) => Promise<{
    id: string;
    ownerId: string;
    phone: string | null;
    storeName: string;
    address: string | null;
    pointMinSpend: number;
    pointRatio: number;
    pointRedeemVal: number;
    pointBonusBirthday: number;
    pointBonusRegistration: number;
    pointExpiryDays: number;
    pointFridayMultiplier: number;
    pointMaxUsagePercent: number;
    pointMinRedeem: number;
}>;
//# sourceMappingURL=pos-settings.service.d.ts.map