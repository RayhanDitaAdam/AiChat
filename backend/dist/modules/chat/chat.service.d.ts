import type { ChatInput } from './chat.schema.js';
export declare class ChatService {
    processChatMessage(input: ChatInput): Promise<{
        message: string;
        status: string;
        sessionId: string | null;
        products?: never;
        nearbyStores?: never;
        userLocation?: never;
        ratingPrompt?: never;
    } | {
        message: string;
        status: string;
        sessionId: string | null | undefined;
        products: {
            name: string;
            id: string;
            image: string | null;
            createdAt: Date;
            updatedAt: Date;
            owner_id: string;
            description: string | null;
            category: string;
            price: number;
            stock: number;
            halal: boolean;
            aisle: string;
            map_url: string | null;
            rak: string;
            videoUrl: string | null;
            ingredients: string | null;
            isFastMoving: boolean;
            isSecondHand: boolean;
            productType: string;
            bedType: string | null;
            room: string | null;
            section: string | null;
            view360Url: string | null;
            barcode: string | null;
            categoryId: string | null;
        }[] | null;
        nearbyStores: any[] | null;
        userLocation: {
            lat: any;
            lng: any;
        } | null;
        ratingPrompt: string;
    }>;
    getSessions(userId: string, ownerId: string): Promise<{
        status: string;
        data: any;
    }>;
    createChatSession(userId: string, ownerId: string): Promise<{
        status: string;
        data: any;
    }>;
    getMessagesBySession(sessionId: string): Promise<{
        status: string;
        history: any;
    }>;
    /**
     * Automatically delete chats older than retention period
     */
    cleanupOldChats(): Promise<{
        status: string;
        deletedCount: any;
    }>;
    /**
     * Request human assistance (staff) - Creates a pending call
     */
    requestStaff(userId: string, ownerId: string, latitude?: number, longitude?: number): Promise<{
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
            user_id: string | null;
            owner_id: string;
            message: string;
            timestamp: Date;
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
}
//# sourceMappingURL=chat.service.d.ts.map