import type { ChatInput } from './chat.schema.js';
export declare class ChatService {
    processChatMessage(input: ChatInput & {
        metadata?: any;
        language?: string;
    }): Promise<{
        message: string;
        status: string;
        sessionId: string | null;
        type?: never;
        chat?: never;
        id?: never;
        timestamp?: never;
        ratingPrompt?: never;
        metadata?: never;
    } | {
        status: string;
        type: string;
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
        message?: never;
        sessionId?: never;
        id?: never;
        timestamp?: never;
        ratingPrompt?: never;
        metadata?: never;
    } | {
        status: string;
        type: string;
        message: string;
        sessionId?: never;
        chat?: never;
        id?: never;
        timestamp?: never;
        ratingPrompt?: never;
        metadata?: never;
    } | {
        id: any;
        message: string;
        status: string;
        sessionId: string | null | undefined;
        timestamp: any;
        ratingPrompt: boolean;
        metadata: {
            products: {
                name: string;
                id: string;
                image: string | null;
                createdAt: Date;
                updatedAt: Date;
                owner_id: string;
                status: string;
                description: string | null;
                price: number;
                purchasePrice: number;
                stock: number;
                halal: boolean;
                aisle: string;
                map_url: string | null;
                category: string;
                rak: string;
                bedType: string | null;
                ingredients: string | null;
                isFastMoving: boolean;
                isSecondHand: boolean;
                productType: string;
                room: string | null;
                section: string | null;
                videoUrl: string | null;
                view360Url: string | null;
                barcode: string | null;
                categoryId: string | null;
                expiryDate: Date | null;
                expiryNotified: boolean;
                warningNotified: boolean;
                contributorId: string | null;
            }[] | null;
            nearbyStores: any[] | null;
            autoAdded: string[] | null;
        };
        type?: never;
        chat?: never;
    }>;
    getSessions(userId: string, ownerId: string, excludeStaffChats?: boolean): Promise<{
        status: string;
        data: any;
    }>;
    toggleSessionPin(sessionId: string, userId: string): Promise<{
        status: string;
        data: any;
    }>;
    createChatSession(userId: string, ownerId: string): Promise<{
        status: string;
        data: any;
    }>;
    getMessagesBySession(sessionId: string, excludeStaffChats?: boolean): Promise<{
        status: string;
        history: any;
    }>;
    /**
     * Request human assistance (staff) - Creates a pending call
     */
    requestStaff(userId: string, ownerId: string, latitude?: number, longitude?: number, targetStaffId?: string): Promise<{
        status: string;
        message: string;
    }>;
    stopStaffSupport(userId: string, ownerId: string, duration?: string): Promise<{
        status: string;
        message: string;
    }>;
    acceptCall(userId: string, ownerId: string): Promise<{
        status: string;
        message: string;
    }>;
    declineCall(userId: string, ownerId: string): Promise<{
        status: string;
        message: string;
    }>;
    /**
     * Get chat history for a user (Filtered by hours or since specific timestamp)
     * Keeping for backward compatibility or general overview
     */
    getChatHistory(userId: string, hours?: number, since?: string): Promise<{
        status: string;
        history: ({
            owner: {
                name: string;
            };
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
    deleteSession(sessionId: string, userId: string): Promise<{
        status: string;
        message: string;
    }>;
    clearUserHistory(userId: string, ownerId: string): Promise<{
        status: string;
        message: string;
    }>;
    getStoreStaff(ownerId: string): Promise<{
        status: string;
        staff: {
            isOnline: boolean;
            name: string | null;
            id: string;
            image: string | null;
            role: import(".prisma/client").$Enums.Role;
            updatedAt: Date;
            position: string | null;
        }[];
    }>;
}
//# sourceMappingURL=chat.service.d.ts.map