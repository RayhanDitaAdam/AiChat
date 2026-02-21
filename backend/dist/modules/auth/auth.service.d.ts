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
            role: import("@prisma/client").$Enums.Role;
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
            role: import("@prisma/client").$Enums.Role;
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
        requires2FA: boolean;
        message: string;
        userId: string;
    }>;
    /**
     * Get user profile from database
     */
    getUserProfile(userId: string): Promise<{
        status: string;
        user: {
            name: string | null;
            id: string;
            email: string;
            image: string | null;
            avatarVariant: string | null;
            role: import("@prisma/client").$Enums.Role;
            ownerId: string | null;
            language: string;
            printerIp: string | null;
            printerPort: number | null;
            customerId: string | null;
            loyaltyPoints: number;
            qrCode: string | null;
            phone: string | null;
            latitude: number | null;
            longitude: number | null;
            disabledMenus: string[];
            medicalRecord: string | null;
            isBlocked: boolean;
            owner: {
                [x: string]: {
                    query: string;
                    id: string;
                    ownerId: string;
                    createdAt: Date;
                    updatedAt: Date;
                    status: string;
                    count: number;
                }[] | {
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
                }[] | {
                    name: string;
                    id: string;
                    ownerId: string;
                    createdAt: Date;
                }[] | {
                    name: string;
                    id: string;
                    image: string | null;
                    createdAt: Date;
                    updatedAt: Date;
                    owner_id: string;
                    description: string | null;
                    price: number;
                    stock: number;
                    halal: boolean;
                    aisle: string;
                    map_url: string | null;
                    category: string;
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
                    expiryDate: Date | null;
                    expiryNotified: boolean;
                    warningNotified: boolean;
                    barcode: string | null;
                    categoryId: string | null;
                    contributorId: string | null;
                }[] | ({
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
                } | {
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
                })[] | ({
                    name: string;
                    id: string;
                    image: string | null;
                    createdAt: Date;
                    updatedAt: Date;
                    owner_id: string;
                    description: string | null;
                    price: number;
                    stock: number;
                    halal: boolean;
                    aisle: string;
                    map_url: string | null;
                    category: string;
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
                    expiryDate: Date | null;
                    expiryNotified: boolean;
                    warningNotified: boolean;
                    barcode: string | null;
                    categoryId: string | null;
                    contributorId: string | null;
                } | {
                    name: string;
                    id: string;
                    image: string | null;
                    createdAt: Date;
                    updatedAt: Date;
                    owner_id: string;
                    description: string | null;
                    price: number;
                    stock: number;
                    halal: boolean;
                    aisle: string;
                    map_url: string | null;
                    category: string;
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
                    expiryDate: Date | null;
                    expiryNotified: boolean;
                    warningNotified: boolean;
                    barcode: string | null;
                    categoryId: string | null;
                    contributorId: string | null;
                })[] | ({
                    id: string;
                    user_id: string | null;
                    owner_id: string;
                    session_id: string | null;
                    guest_id: string | null;
                    score: number;
                    feedback: string | null;
                } | {
                    id: string;
                    user_id: string | null;
                    owner_id: string;
                    session_id: string | null;
                    guest_id: string | null;
                    score: number;
                    feedback: string | null;
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
                    batchId: string | null;
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
                    batchId: string | null;
                })[] | ({
                    id: string;
                    ownerId: string;
                    createdAt: Date;
                    total: number;
                    discount: number;
                    paymentMethod: string;
                    memberId: string | null;
                    cashierId: string;
                } | {
                    id: string;
                    ownerId: string;
                    createdAt: Date;
                    total: number;
                    discount: number;
                    paymentMethod: string;
                    memberId: string | null;
                    cashierId: string;
                })[] | ({
                    id: string;
                    ownerId: string;
                    createdAt: Date;
                    status: string;
                    userId: string;
                    content: string;
                    remindAt: Date;
                } | {
                    id: string;
                    ownerId: string;
                    createdAt: Date;
                    status: string;
                    userId: string;
                    content: string;
                    remindAt: Date;
                })[] | ({
                    id: string;
                    ownerId: string;
                    createdAt: Date;
                    updatedAt: Date;
                    status: string;
                    userId: string;
                } | {
                    id: string;
                    ownerId: string;
                    createdAt: Date;
                    updatedAt: Date;
                    status: string;
                    userId: string;
                })[] | {
                    id: string;
                    user_id: string | null;
                    owner_id: string;
                    session_id: string | null;
                    guest_id: string | null;
                    score: number;
                    feedback: string | null;
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
                    batchId: string | null;
                }[] | {
                    id: string;
                    ownerId: string;
                    createdAt: Date;
                    total: number;
                    discount: number;
                    paymentMethod: string;
                    memberId: string | null;
                    cashierId: string;
                }[] | {
                    id: string;
                    ownerId: string;
                    createdAt: Date;
                    status: string;
                    userId: string;
                    content: string;
                    remindAt: Date;
                }[] | {
                    id: string;
                    ownerId: string;
                    createdAt: Date;
                    updatedAt: Date;
                    status: string;
                    userId: string;
                }[] | {
                    name: string;
                    id: string;
                    image: string | null;
                    ownerId: string;
                    stock: number;
                    pointsRequired: number;
                }[] | ({
                    name: string | null;
                    id: string;
                    email: string;
                    googleId: string | null;
                    githubId: string | null;
                    password: string | null;
                    image: string | null;
                    avatarVariant: string | null;
                    role: import("@prisma/client").$Enums.Role;
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
                    resetPasswordToken: string | null;
                    resetPasswordExpires: Date | null;
                    resetPasswordAttempts: number;
                    resetPasswordLockedUntil: Date | null;
                    loginAttempts: number;
                    loginLockedUntil: Date | null;
                    username: string | null;
                    dob: Date | null;
                    points: number;
                    twoFactorEnabled: boolean;
                    twoFactorCode: string | null;
                    twoFactorCodeExpiry: Date | null;
                    twoFactorRetryCount: number;
                } | {
                    name: string | null;
                    id: string;
                    email: string;
                    googleId: string | null;
                    githubId: string | null;
                    password: string | null;
                    image: string | null;
                    avatarVariant: string | null;
                    role: import("@prisma/client").$Enums.Role;
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
                    resetPasswordToken: string | null;
                    resetPasswordExpires: Date | null;
                    resetPasswordAttempts: number;
                    resetPasswordLockedUntil: Date | null;
                    loginAttempts: number;
                    loginLockedUntil: Date | null;
                    username: string | null;
                    dob: Date | null;
                    points: number;
                    twoFactorEnabled: boolean;
                    twoFactorCode: string | null;
                    twoFactorCodeExpiry: Date | null;
                    twoFactorRetryCount: number;
                })[] | ({
                    query: string;
                    id: string;
                    ownerId: string;
                    createdAt: Date;
                    updatedAt: Date;
                    status: string;
                    count: number;
                } | {
                    query: string;
                    id: string;
                    ownerId: string;
                    createdAt: Date;
                    updatedAt: Date;
                    status: string;
                    count: number;
                })[] | ({
                    id: string;
                    ownerId: string;
                    createdAt: Date;
                    updatedAt: Date;
                    phone: string;
                    address: string;
                    title: string;
                    companyName: string;
                    detail: string;
                    salary: string | null;
                } | {
                    id: string;
                    ownerId: string;
                    createdAt: Date;
                    updatedAt: Date;
                    phone: string;
                    address: string;
                    title: string;
                    companyName: string;
                    detail: string;
                    salary: string | null;
                })[] | ({
                    name: string;
                    id: string;
                    ownerId: string;
                    createdAt: Date;
                    view360Url: string | null;
                } | {
                    name: string;
                    id: string;
                    ownerId: string;
                    createdAt: Date;
                    view360Url: string | null;
                })[] | ({
                    name: string;
                    id: string;
                    image: string | null;
                    ownerId: string;
                    stock: number;
                    pointsRequired: number;
                } | {
                    name: string;
                    id: string;
                    image: string | null;
                    ownerId: string;
                    stock: number;
                    pointsRequired: number;
                })[] | ({
                    name: string;
                    id: string;
                    ownerId: string;
                    createdAt: Date;
                } | {
                    name: string;
                    id: string;
                    ownerId: string;
                    createdAt: Date;
                })[] | {
                    name: string | null;
                    id: string;
                    email: string;
                    googleId: string | null;
                    githubId: string | null;
                    password: string | null;
                    image: string | null;
                    avatarVariant: string | null;
                    role: import("@prisma/client").$Enums.Role;
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
                    resetPasswordToken: string | null;
                    resetPasswordExpires: Date | null;
                    resetPasswordAttempts: number;
                    resetPasswordLockedUntil: Date | null;
                    loginAttempts: number;
                    loginLockedUntil: Date | null;
                    username: string | null;
                    dob: Date | null;
                    points: number;
                    twoFactorEnabled: boolean;
                    twoFactorCode: string | null;
                    twoFactorCodeExpiry: Date | null;
                    twoFactorRetryCount: number;
                }[] | {
                    id: string;
                    ownerId: string;
                    createdAt: Date;
                    updatedAt: Date;
                    phone: string;
                    address: string;
                    title: string;
                    companyName: string;
                    detail: string;
                    salary: string | null;
                }[] | {
                    name: string;
                    id: string;
                    ownerId: string;
                    createdAt: Date;
                    view360Url: string | null;
                }[];
                [x: number]: never;
                [x: symbol]: never;
            } | null;
            memberOf: {
                name: string;
                id: string;
                domain: string;
            } | null;
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
                businessCategory: string;
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
                businessCategory: string;
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
            role: import("@prisma/client").$Enums.Role;
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
            resetPasswordToken: string | null;
            resetPasswordExpires: Date | null;
            resetPasswordAttempts: number;
            resetPasswordLockedUntil: Date | null;
            loginAttempts: number;
            loginLockedUntil: Date | null;
            username: string | null;
            dob: Date | null;
            points: number;
            twoFactorEnabled: boolean;
            twoFactorCode: string | null;
            twoFactorCodeExpiry: Date | null;
            twoFactorRetryCount: number;
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
            role: import("@prisma/client").$Enums.Role;
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
            resetPasswordToken: string | null;
            resetPasswordExpires: Date | null;
            resetPasswordAttempts: number;
            resetPasswordLockedUntil: Date | null;
            loginAttempts: number;
            loginLockedUntil: Date | null;
            username: string | null;
            dob: Date | null;
            points: number;
            twoFactorEnabled: boolean;
            twoFactorCode: string | null;
            twoFactorCodeExpiry: Date | null;
            twoFactorRetryCount: number;
        };
    }>;
    /**
     * Generate reset password token and send email
     */
    forgotPassword(email: string): Promise<{
        status: string;
        message: string;
    }>;
    /**
     * Reset password using token
     */
    resetPassword(input: {
        token: string;
        password: any;
    }): Promise<{
        status: string;
        message: string;
    }>;
    /**
     * Generate random 2-digit code for email 2FA
     */
    private generateEmailCode;
    /**
     * Generate 2 decoy codes different from the correct code
     */
    private generateDecoyCodes;
    /**
     * POST /api/auth/2fa/setup - Enable 2FA for user
     */
    enable2FA(userId: string): Promise<{
        status: string;
        message: string;
    }>;
    /**
     * Disable 2FA for user
     */
    disable2FA(userId: string): Promise<{
        status: string;
        message: string;
    }>;
    /**
     * Completes the 2FA login by verifying the email code
     */
    login2FA(userId: string, code: string): Promise<{
        status: string;
        message: string;
        token: string;
        refreshToken: string;
        user: {
            id: string;
            email: string;
            name: string | null;
            image: string | null;
            role: import("@prisma/client").$Enums.Role;
            ownerId: string | null;
            customerId: any;
            qrCode: any;
            loyaltyPoints: any;
            owner: {
                businessCategory: any;
                name?: string;
                id?: string;
                avatarVariant?: string | null;
                latitude?: number | null;
                longitude?: number | null;
                domain?: string;
                ownerCode?: string | null;
                isApproved?: boolean;
                address?: string | null;
                postalCode?: string | null;
                googleMapsUrl?: string | null;
            };
            memberOf: any;
            phone: any;
            disabledMenus: any;
            isBlocked: any;
            avatarVariant: string | null;
            isApproved: any;
        };
    }>;
}
//# sourceMappingURL=auth.service.d.ts.map