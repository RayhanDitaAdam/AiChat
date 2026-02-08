export declare const getRewards: (ownerId: string) => Promise<{
    name: string;
    id: string;
    image: string | null;
    ownerId: string;
    stock: number;
    pointsRequired: number;
}[]>;
export declare const createReward: (data: any, ownerId: string) => Promise<{
    name: string;
    id: string;
    image: string | null;
    ownerId: string;
    stock: number;
    pointsRequired: number;
}>;
export declare const redeemReward: (memberId: string, rewardId: string, ownerId: string) => Promise<{
    success: boolean;
    rewardName: string;
}>;
//# sourceMappingURL=reward.service.d.ts.map