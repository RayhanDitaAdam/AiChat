export declare class OwnerService {
    /**
     * Get missing product requests for owner
     */
    getMissingRequests(ownerId: string): Promise<{
        status: string;
        requests: {
            id: string;
            owner_id: string;
            product_name: string;
            count: number;
        }[];
    }>;
    /**
     * Get ratings for owner
     */
    getRatings(ownerId: string): Promise<{
        status: string;
        ratings: ({
            user: {
                name: string | null;
                email: string;
            };
        } & {
            id: string;
            user_id: string;
            owner_id: string;
            score: number;
            feedback: string | null;
        })[];
    }>;
    /**
     * Get chat history for owner
     */
    getChatHistory(ownerId: string): Promise<{
        status: string;
        chats: ({
            user: {
                name: string | null;
                email: string;
            };
        } & {
            id: string;
            role: string;
            latitude: number | null;
            longitude: number | null;
            user_id: string;
            owner_id: string;
            message: string;
            timestamp: Date;
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
            config: {
                showChat: boolean;
            } | null;
        };
    }>;
    /**
     * Get active live support sessions for owner
     */
    getLiveSupportSessions(ownerId: string): Promise<{
        status: string;
        sessions: any[];
    }>;
    /**
     * Respond to a user in live chat
     */
    respondToChat(ownerId: string, userId: string, message: string): Promise<{
        status: string;
        chat: {
            id: string;
            role: string;
            latitude: number | null;
            longitude: number | null;
            user_id: string;
            owner_id: string;
            message: string;
            timestamp: Date;
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
            user_id: string;
            owner_id: string;
            message: string;
            timestamp: Date;
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
    }): Promise<{
        status: string;
        owner: {
            name: string;
            id: string;
            avatarVariant: string | null;
            latitude: number | null;
            longitude: number | null;
            domain: string;
            ownerCode: string | null;
            isApproved: boolean;
            address: string | null;
            postalCode: string | null;
            googleMapsUrl: string | null;
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
        members: {
            name: string | null;
            id: string;
            email: string;
            image: string | null;
            role: import(".prisma/client").$Enums.Role;
            customerId: string | null;
            phone: string | null;
        }[];
    }>;
    updateMemberRole(ownerId: string, memberId: string, role: string): Promise<{
        status: string;
        message: string;
        user: {
            name: string | null;
            id: string;
            email: string;
            googleId: string | null;
            githubId: string | null;
            password: string | null;
            image: string | null;
            avatarVariant: string | null;
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
            position: string | null;
            latitude: number | null;
            longitude: number | null;
            disabledMenus: string[];
            medicalRecord: string | null;
            isBlocked: boolean;
            registrationType: string;
            isEmailVerified: boolean;
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
}
//# sourceMappingURL=owner.service.d.ts.map