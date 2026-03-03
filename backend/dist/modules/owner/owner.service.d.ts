export declare class OwnerService {
    /**
     * Get missing product requests for owner
     */
    getMissingRequests(ownerId: string, contributorId?: string): Promise<{
        status: string;
        requests: {
            query: string;
            id: string;
            ownerId: string;
            createdAt: Date;
            updatedAt: Date;
            status: string;
            count: number;
        }[];
    }>;
    /**
     * Get ratings for owner
     */
    getRatings(ownerId: string, contributorId?: string): Promise<{
        status: string;
        ratings: ({
            user: {
                name: string | null;
                email: string;
            } | null;
        } & {
            id: string;
            user_id: string | null;
            owner_id: string;
            session_id: string | null;
            score: number;
            feedback: string | null;
            guest_id: string | null;
        })[];
    }>;
    /**
     * Get staff activity log
     */
    getStaffActivity(ownerId: string, staffId: string): Promise<{
        status: string;
        activities: {
            id: string;
            ownerId: string;
            createdAt: Date;
            action: string;
            details: import("@prisma/client/runtime/library").JsonValue | null;
            description: string | null;
            staffId: string;
            isRead: boolean;
        }[];
    }>;
    /**
     * Get chat history for owner
     */
    getChatHistory(ownerId: string, contributorId?: string): Promise<{
        status: string;
        chats: ({
            user: {
                name: string | null;
                email: string;
            } | null;
        } & {
            id: string;
            role: string;
            latitude: number | null;
            longitude: number | null;
            timestamp: Date;
            user_id: string | null;
            owner_id: string;
            message: string;
            status: string | null;
            session_id: string | null;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
        })[];
    }>;
    /**
     * Get owner details by domain (Public)
     */
    getOwnerByDomain(domain: string): Promise<{
        status: string;
        owner: {
            name: string;
            user: {
                isBlocked: boolean;
            } | null;
            id: string;
            domain: string;
            businessCategory: string;
            config: {
                showChat: boolean;
            } | null;
        };
    }>;
    /**
     * Get active live support sessions for owner
     */
    getLiveSupportSessions(ownerId: string, contributorId?: string): Promise<{
        status: string;
        sessions: any[];
    }>;
    /**
     * Respond to a user in live chat
     * Staff replies are ephemeral - no database storage
     */
    respondToChat(ownerId: string, userId: string, message: string, staffId?: string): Promise<{
        status: string;
        chat: {
            id: string;
            role: string;
            latitude: number | null;
            longitude: number | null;
            timestamp: Date;
            user_id: string | null;
            owner_id: string;
            message: string;
            status: string | null;
            session_id: string | null;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
        };
    }>;
    /**
     * Get chat history for a specific user in live support
     */
    getLiveChatHistory(ownerId: string, userId: string, since?: string): Promise<{
        status: string;
        chats: {
            id: string;
            role: string;
            latitude: number | null;
            longitude: number | null;
            timestamp: Date;
            user_id: string | null;
            owner_id: string;
            message: string;
            status: string | null;
            session_id: string | null;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
        }[];
    }>;
    /**
     * Update store settings for owner
     */
    updateStoreSettings(ownerId: string, data: {
        name?: string;
        domain?: string;
        latitude?: number;
        longitude?: number;
        businessCategory?: string;
    }): Promise<{
        status: string;
        owner: {
            name: string;
            id: string;
            latitude: number | null;
            longitude: number | null;
            avatarVariant: string | null;
            domain: string;
            isApproved: boolean;
            address: string | null;
            googleMapsUrl: string | null;
            ownerCode: string | null;
            postalCode: string | null;
            businessCategory: string;
        };
    }>;
    /**
     * Find stores within a specific radius (km)
     */
    findNearbyStores(lat: number, lng: number, radiusKm?: number): Promise<{
        status: string;
        stores: {
            distance: number;
            name: string;
            id: string;
            latitude: number | null;
            longitude: number | null;
            domain: string;
        }[];
    }>;
    getStoreMembers(ownerId: string): Promise<{
        status: string;
        members: any[];
    }>;
    deleteMember(ownerId: string, memberId: string): Promise<{
        status: string;
        message: string;
    }>;
    deleteMembers(ownerId: string, memberIds: string[]): Promise<{
        status: string;
        message: string;
        count: number;
    }>;
    updateMemberRole(ownerId: string, memberId: string, role: string): Promise<{
        status: string;
        message: string;
        user: {
            name: string | null;
            id: string;
            email: string;
            googleId: string | null;
            password: string | null;
            image: string | null;
            role: import(".prisma/client").$Enums.Role;
            ownerId: string | null;
            language: string;
            createdAt: Date;
            updatedAt: Date;
            printerIp: string | null;
            printerPort: number | null;
            customerId: string | null;
            loyaltyPoints: number;
            memberOfId: string | null;
            qrCode: string | null;
            phone: string | null;
            disabledMenus: string[];
            githubId: string | null;
            isBlocked: boolean;
            isEmailVerified: boolean;
            latitude: number | null;
            longitude: number | null;
            medicalRecord: string | null;
            position: string | null;
            registrationType: string;
            avatarVariant: string | null;
            dob: Date | null;
            points: number;
            username: string | null;
            loginAttempts: number;
            loginLockedUntil: Date | null;
            resetPasswordAttempts: number;
            resetPasswordExpires: Date | null;
            resetPasswordLockedUntil: Date | null;
            resetPasswordToken: string | null;
            twoFactorCode: string | null;
            twoFactorCodeExpiry: Date | null;
            twoFactorEnabled: boolean;
            twoFactorRetryCount: number;
            superAdminKeyHash: string | null;
            staffRoleId: string | null;
            receiptWidth: string | null;
            allowChatReview: boolean;
        };
    }>;
    updateMember(ownerId: string, memberId: string, data: {
        name?: string;
        phone?: string;
        position?: string;
        role?: string;
        staffRoleId?: string;
        disabledMenus?: string[];
    }): Promise<{
        status: string;
        message: string;
        user: {
            name: string | null;
            id: string;
            email: string;
            googleId: string | null;
            password: string | null;
            image: string | null;
            role: import(".prisma/client").$Enums.Role;
            ownerId: string | null;
            language: string;
            createdAt: Date;
            updatedAt: Date;
            printerIp: string | null;
            printerPort: number | null;
            customerId: string | null;
            loyaltyPoints: number;
            memberOfId: string | null;
            qrCode: string | null;
            phone: string | null;
            disabledMenus: string[];
            githubId: string | null;
            isBlocked: boolean;
            isEmailVerified: boolean;
            latitude: number | null;
            longitude: number | null;
            medicalRecord: string | null;
            position: string | null;
            registrationType: string;
            avatarVariant: string | null;
            dob: Date | null;
            points: number;
            username: string | null;
            loginAttempts: number;
            loginLockedUntil: Date | null;
            resetPasswordAttempts: number;
            resetPasswordExpires: Date | null;
            resetPasswordLockedUntil: Date | null;
            resetPasswordToken: string | null;
            twoFactorCode: string | null;
            twoFactorCodeExpiry: Date | null;
            twoFactorEnabled: boolean;
            twoFactorRetryCount: number;
            superAdminKeyHash: string | null;
            staffRoleId: string | null;
            receiptWidth: string | null;
            allowChatReview: boolean;
        };
    }>;
    /**
     * Create a new staff account directly (Assigned to this store)
     */
    createStaffAccount(ownerId: string, data: any): Promise<{
        status: string;
        message: string;
        user: {
            id: string;
            email: string;
            name: string | null;
            role: import(".prisma/client").$Enums.Role;
            customerId: string | null;
        };
    }>;
    getStaffRoles(ownerId: string): Promise<{
        status: string;
        roles: {
            name: string;
            id: string;
            ownerId: string;
            createdAt: Date;
            permissions: import("@prisma/client/runtime/library").JsonValue | null;
        }[];
    }>;
    createStaffRole(ownerId: string, name: string, permissions?: any): Promise<{
        status: string;
        role: {
            name: string;
            id: string;
            ownerId: string;
            createdAt: Date;
            permissions: import("@prisma/client/runtime/library").JsonValue | null;
        };
    }>;
    updateStaffRole(ownerId: string, roleId: string, data: {
        name?: string;
        permissions?: any;
    }): Promise<{
        status: string;
        role: {
            name: string;
            id: string;
            ownerId: string;
            createdAt: Date;
            permissions: import("@prisma/client/runtime/library").JsonValue | null;
        };
    }>;
    deleteStaffRole(ownerId: string, roleId: string): Promise<{
        status: string;
        message: string;
    }>;
    /**
     * Get owner configuration (including AI tuning)
     */
    getOwnerConfig(ownerId: string): Promise<{
        status: string;
        config: {
            id: string;
            owner_id: string;
            showInventory: boolean;
            showChat: boolean;
            aiMaxTokens: number;
            aiSystemPrompt: string | null;
            aiGuestSystemPrompt: string | null;
            aiTemperature: number;
            aiTone: string;
            aiTopK: number;
            aiTopP: number;
            workshopPhone: string | null;
            workshopTaxId: string | null;
            workshopInvoiceFooter: string | null;
            workshopAccentColor: string | null;
        };
    }>;
    /**
     * Update owner configuration
     */
    updateOwnerConfig(ownerId: string, data: any): Promise<{
        status: string;
        config: {
            id: string;
            owner_id: string;
            showInventory: boolean;
            showChat: boolean;
            aiMaxTokens: number;
            aiSystemPrompt: string | null;
            aiGuestSystemPrompt: string | null;
            aiTemperature: number;
            aiTone: string;
            aiTopK: number;
            aiTopP: number;
            workshopPhone: string | null;
            workshopTaxId: string | null;
            workshopInvoiceFooter: string | null;
            workshopAccentColor: string | null;
        };
    }>;
}
//# sourceMappingURL=owner.service.d.ts.map