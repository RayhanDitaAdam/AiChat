export declare class AdminService {
    getStats(days?: number): Promise<{
        users: any;
        owners: any;
        totalChats: any;
        totalProducts: any;
        history: {
            date: string;
            count: number;
        }[];
    }>;
    getMissingRequests(): Promise<any>;
    getOwners(): Promise<any>;
    updateOwnerCategory(ownerId: string, businessCategory: string): Promise<any>;
    createOwner(data: {
        name: string;
        email: string;
        domain: string;
        password?: string;
    }): Promise<any>;
    deleteOwner(ownerId: string): Promise<any>;
    updateOwner(ownerId: string, data: {
        name?: string;
        domain?: string;
        isApproved?: boolean;
        isBlocked?: boolean;
    }): Promise<any>;
    approveOwner(ownerId: string, isApproved: boolean): Promise<any>;
    updateOwnerConfig(ownerId: string, config: {
        showInventory?: boolean;
        showChat?: boolean;
    }): Promise<any>;
    getSystemConfig(): Promise<any>;
    updateSystemConfig(config: {
        aiSystemPrompt?: string;
        aiGuestSystemPrompt?: string;
        geminiApiKey?: string;
        deepseekApiKey?: string;
        chatRetentionDays?: number;
        dailyChatLimitUser?: number;
        dailyChatLimitOwner?: number;
        aiTemperature?: number;
        aiTopP?: number;
        aiMaxTokens?: number;
        aiTone?: string;
        aiModel?: string;
        companyName?: string;
        companyLogo?: string;
    }): Promise<any>;
    getUsers(): Promise<any>;
    updateUserMenus(userId: string, disabledMenus: string[]): Promise<any>;
    toggleUserBlock(userId: string, isBlocked: boolean): Promise<any>;
    getAdmins(): Promise<any>;
    deleteAdmin(userId: string, superAdminId: string, ipAddress: string): Promise<any>;
    createAdmin(data: {
        email: string;
        name: string;
        password?: string;
    }, superAdminId: string, ipAddress: string): Promise<any>;
    updateAdmin(userId: string, data: {
        name?: string;
        email?: string;
        isBlocked?: boolean;
    }, superAdminId: string, ipAddress: string): Promise<any>;
    generateDatabaseBackup(superAdminId: string, ipAddress: string): Promise<string>;
}
//# sourceMappingURL=admin.service.d.ts.map