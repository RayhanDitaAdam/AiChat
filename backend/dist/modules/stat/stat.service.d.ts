export declare class StatService {
    getGlobalStats(): Promise<{
        status: string;
        stats: {
            totalOwners: number;
            totalUsers: number;
            totalProducts: number;
            totalVacancies: any;
        };
    }>;
    getOwnerStats(ownerId: string): Promise<{
        status: string;
        stats: {
            totalMembers: number;
            totalProducts: number;
            totalTasks: any;
            totalStaff: number;
            totalSalesIntent: number;
        };
    }>;
}
//# sourceMappingURL=stat.service.d.ts.map