export declare class AdminService {
    getStats(): Promise<{
        users: any;
        owners: any;
        totalChats: any;
        totalProducts: any;
    }>;
    getMissingRequests(): Promise<any>;
    getOwners(): Promise<any>;
    updateOwnerCategory(ownerId: string, businessCategory: string): Promise<any>;
    approveOwner(ownerId: string, isApproved: boolean): Promise<any>;
    updateOwnerConfig(ownerId: string, config: {
        showInventory?: boolean;
        showChat?: boolean;
    }): Promise<any>;
    getSystemConfig(): Promise<any>;
    updateSystemConfig(config: {
        aiSystemPrompt?: string;
        geminiApiKey?: string;
        chatRetentionDays?: number;
        dailyChatLimitUser?: number;
        dailyChatLimitOwner?: number;
    }): Promise<any>;
    getUsers(): Promise<any>;
    updateUserMenus(userId: string, disabledMenus: string[]): Promise<any>;
    toggleUserBlock(userId: string, isBlocked: boolean): Promise<any>;
}
//# sourceMappingURL=admin.service.d.ts.map