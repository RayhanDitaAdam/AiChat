export declare const getSalesAnalytics: (ownerId: string, period?: "daily" | "monthly") => Promise<{
    date: string;
    total: unknown;
}[]>;
export declare const getTopSellingProducts: (ownerId: string, limit?: number) => Promise<{
    totalSold: number | null;
    totalRevenue: number;
    name?: string;
    image?: string | null;
    price?: number;
    stock?: number;
}[]>;
export declare const getStockAlerts: (ownerId: string, threshold?: number) => Promise<{
    name: string;
    id: string;
    image: string | null;
    category: string;
    stock: number;
}[]>;
//# sourceMappingURL=report.service.d.ts.map