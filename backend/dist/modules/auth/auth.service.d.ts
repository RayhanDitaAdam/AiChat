import type { GoogleTokenInput, RegisterInput, LoginInput } from './auth.schema.js';
export declare class AuthService {
    /**
     * Verify GitHub code and create/update user
     */
    authenticateWithGitHub(code: string): Promise<{
        status: string;
        token: string;
        refreshToken: string;
        user: {
            id: string;
            email: string;
            name: string | null;
            image: string | null;
            role: import(".prisma/client").$Enums.Role;
            ownerId: string | null;
            phone: string | null;
            disabledMenus: string[];
            isBlocked: any;
            avatarVariant: string | null;
        };
    }>;
    /**
     * Verify Google token and create/update user
     */
    authenticateWithGoogle(input: GoogleTokenInput): Promise<{
        status: string;
        token: string;
        refreshToken: string;
        user: {
            id: string;
            email: string;
            name: string | null;
            image: string | null;
            role: import(".prisma/client").$Enums.Role;
            ownerId: string | null;
            phone: string | null;
            disabledMenus: string[];
            isBlocked: any;
            avatarVariant: string | null;
        };
    }>;
    /**
     * Register new user with email and password
     */
    /**
     * Register new user with email and password
     */
    /**
     * Generate unique customer ID (CUST-0012345 format)
     */
    private generateCustomerId;
    /**
     * Generate 7-digit sequential owner code (0000001 format)
     */
    private generateOwnerCode;
    /**
     * Register new user with email and password
     */
    register(input: RegisterInput): Promise<{
        status: string;
        requiresVerification: boolean;
        email: string;
    }>;
    /**
     * Login with email and password
     */
    login(input: LoginInput): Promise<{
        status: string;
        message: string;
        token: string;
        refreshToken: string;
        user: {
            id: string;
            email: string;
            name: string | null;
            image: string | null;
            role: import(".prisma/client").$Enums.Role;
            ownerId: string | null;
            customerId: any;
            qrCode: any;
            loyaltyPoints: any;
            owner: any;
            memberOf: any;
            phone: any;
            disabledMenus: any;
            isBlocked: any;
            avatarVariant: string | null;
            isApproved: any;
        };
    }>;
    /**
     * Get user profile from database
     */
    getUserProfile(userId: string): Promise<{
        status: string;
        user: {
            [x: string]: ({
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
            } | {
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
            })[] | ({
                id: string;
                createdAt: Date;
                userId: string;
                amount: number;
                description: string;
                type: string;
            } | {
                id: string;
                createdAt: Date;
                userId: string;
                amount: number;
                description: string;
                type: string;
            })[] | ({
                id: string;
                user_id: string;
                owner_id: string;
                score: number;
                feedback: string | null;
            } | {
                id: string;
                user_id: string;
                owner_id: string;
                score: number;
                feedback: string | null;
            })[] | ({
                id: string;
                user_id: string;
                product: string;
                remind_date: Date;
            } | {
                id: string;
                user_id: string;
                product: string;
                remind_date: Date;
            })[] | ({
                id: string;
                ownerId: string;
                createdAt: Date;
                updatedAt: Date;
                status: string;
                assignedToId: string | null;
                location: string;
                taskDetail: string;
                report: string | null;
                taskDate: Date;
                subLocationId: string | null;
            } | {
                id: string;
                ownerId: string;
                createdAt: Date;
                updatedAt: Date;
                status: string;
                assignedToId: string | null;
                location: string;
                taskDetail: string;
                report: string | null;
                taskDate: Date;
                subLocationId: string | null;
            })[] | {
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
            }[] | {
                id: string;
                createdAt: Date;
                userId: string;
                amount: number;
                description: string;
                type: string;
            }[] | {
                id: string;
                user_id: string;
                owner_id: string;
                score: number;
                feedback: string | null;
            }[] | {
                id: string;
                user_id: string;
                product: string;
                remind_date: Date;
            }[] | {
                id: string;
                ownerId: string;
                createdAt: Date;
                updatedAt: Date;
                status: string;
                assignedToId: string | null;
                location: string;
                taskDetail: string;
                report: string | null;
                taskDate: Date;
                subLocationId: string | null;
            }[];
            [x: number]: never;
            [x: symbol]: never;
        };
    }>;
    /**
     * Update user profile
     */
    updateProfile(userId: string, data: any): Promise<{
        status: string;
        message: string;
        user: {
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
            } | null;
            memberOf: {
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
            } | null;
        } & {
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
     * Refresh tokens using a refresh token
     */
    refreshTokens(refreshToken: string): Promise<{
        status: string;
        token: string;
        refreshToken: string;
    }>;
    verifyEmail(email: string, code: string): Promise<{
        status: string;
        message: string;
    }>;
    /**
     * Get list of public stores (Approved owners)
     */
    getPublicStores(): Promise<{
        status: string;
        stores: {
            name: string;
            id: string;
            latitude: number | null;
            longitude: number | null;
            domain: string;
            address: string | null;
        }[];
    }>;
    /**
     * Join a store (One-time assignment for new OAuth users)
     */
    joinStore(userId: string, storeId: string): Promise<{
        status: string;
        message: string;
        user: {
            memberOf: {
                name: string;
                id: string;
                domain: string;
            } | null;
        } & {
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
}
//# sourceMappingURL=auth.service.d.ts.map