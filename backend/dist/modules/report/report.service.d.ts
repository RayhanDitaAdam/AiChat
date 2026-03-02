export declare const getSalesAnalytics: (ownerId: string, period?: "daily" | "monthly", contributorId?: string) => Promise<{
    date: string;
    total: number;
    profit: number;
}[]>;
export declare const getComprehensiveReport: (ownerId: string, startDate?: string, endDate?: string, contributorId?: string) => Promise<{
    summary: {
        totalRevenue: any;
        totalProfit: any;
        transactionCount: number;
        avgOrderValue: number;
        memberTransactions: number;
        guestTransactions: number;
        loyaltyRate: number;
    };
    payments: unknown[];
    categories: unknown[];
}>;
export declare const getTopSellingProducts: (ownerId: string, limit?: number, contributorId?: string) => Promise<{
    name: string;
    sales: number;
    revenue: number;
}[]>;
export declare const getStockAlerts: (ownerId: string, threshold?: number, contributorId?: string) => Promise<{
    name: string;
    id: string;
    stock: number;
    category: string;
}[]>;
//# sourceMappingURL=report.service.d.ts.map