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
        userId: string;
        requires2FA?: never;
        message?: never;
    } | {
        status: string;
        requires2FA: boolean;
        message: string;
        userId: string;
    }>;
    /**
     * Verify Super Admin Key File
     */
    verifyKeyFile(userId: string, keyContent: string): Promise<{
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
     * Get user profile from database
     */
    getUserProfile(userId: string): Promise<{
        status: string;
        user: {
            name: string | null;
            id: string;
            email: string;
            image: string | null;
            role: import("@prisma/client").$Enums.Role;
            ownerId: string | null;
            language: string;
            printerIp: string | null;
            printerPort: number | null;
            customerId: string | null;
            loyaltyPoints: number;
            memberOfId: string | null;
            qrCode: string | null;
            phone: string | null;
            disabledMenus: string[];
            isBlocked: boolean;
            latitude: number | null;
            longitude: number | null;
            medicalRecord: string | null;
            avatarVariant: string | null;
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
                    ownerId: string;
                    createdAt: Date;
                    action: string;
                    details: import("@prisma/client/runtime/library").JsonValue | null;
                    description: string | null;
                    staffId: string;
                    isRead: boolean;
                }[] | {
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
                }[] | {
                    name: string;
                    id: string;
                    ownerId: string;
                    createdAt: Date;
                    permissions: import("@prisma/client/runtime/library").JsonValue | null;
                }[] | {
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
                }[] | ({
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
                } | {
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
                } | {
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
                })[] | ({
                    id: string;
                    user_id: string | null;
                    owner_id: string;
                    session_id: string | null;
                    score: number;
                    feedback: string | null;
                    guest_id: string | null;
                } | {
                    id: string;
                    user_id: string | null;
                    owner_id: string;
                    session_id: string | null;
                    score: number;
                    feedback: string | null;
                    guest_id: string | null;
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
                    action: string;
                    details: import("@prisma/client/runtime/library").JsonValue | null;
                    description: string | null;
                    staffId: string;
                    isRead: boolean;
                } | {
                    id: string;
                    ownerId: string;
                    createdAt: Date;
                    action: string;
                    details: import("@prisma/client/runtime/library").JsonValue | null;
                    description: string | null;
                    staffId: string;
                    isRead: boolean;
                })[] | ({
                    id: string;
                    ownerId: string;
                    createdAt: Date;
                    memberId: string | null;
                    total: number;
                    discount: number;
                    paymentMethod: string;
                    cashierId: string;
                } | {
                    id: string;
                    ownerId: string;
                    createdAt: Date;
                    memberId: string | null;
                    total: number;
                    discount: number;
                    paymentMethod: string;
                    cashierId: string;
                })[] | {
                    id: string;
                    ownerId: string;
                    createdAt: Date;
                    updatedAt: Date;
                    status: string;
                    userId: string;
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
                    user_id: string | null;
                    owner_id: string;
                    session_id: string | null;
                    score: number;
                    feedback: string | null;
                    guest_id: string | null;
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
                    memberId: string | null;
                    total: number;
                    discount: number;
                    paymentMethod: string;
                    cashierId: string;
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
                    password: string | null;
                    image: string | null;
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
                } | {
                    name: string | null;
                    id: string;
                    email: string;
                    googleId: string | null;
                    password: string | null;
                    image: string | null;
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
                    id: string;
                    ownerId: string;
                    createdAt: Date;
                    updatedAt: Date;
                    content: string | null;
                    title: string;
                    fileUrl: string;
                    fileType: string;
                } | {
                    id: string;
                    ownerId: string;
                    createdAt: Date;
                    updatedAt: Date;
                    content: string | null;
                    title: string;
                    fileUrl: string;
                    fileType: string;
                })[] | ({
                    name: string;
                    id: string;
                    ownerId: string;
                    createdAt: Date;
                    permissions: import("@prisma/client/runtime/library").JsonValue | null;
                } | {
                    name: string;
                    id: string;
                    ownerId: string;
                    createdAt: Date;
                    permissions: import("@prisma/client/runtime/library").JsonValue | null;
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
                    ownerId: string;
                    createdAt: Date;
                    updatedAt: Date;
                    description: string | null;
                } | {
                    name: string;
                    id: string;
                    ownerId: string;
                    createdAt: Date;
                    updatedAt: Date;
                    description: string | null;
                })[] | ({
                    id: string;
                    ownerId: string;
                    createdAt: Date;
                    updatedAt: Date;
                    date: Date;
                } | {
                    id: string;
                    ownerId: string;
                    createdAt: Date;
                    updatedAt: Date;
                    date: Date;
                })[] | ({
                    id: string;
                    ownerId: string;
                    createdAt: Date;
                    updatedAt: Date;
                    status: string;
                    paymentMethod: string | null;
                    mechanic: string | null;
                    mechanicId: string | null;
                    vehiclePlate: string;
                    vehicleType: string | null;
                    customerName: string;
                    customerPhone: string | null;
                    complaints: string;
                    notes: string | null;
                    totalCost: number | null;
                    isPaid: boolean;
                } | {
                    id: string;
                    ownerId: string;
                    createdAt: Date;
                    updatedAt: Date;
                    status: string;
                    paymentMethod: string | null;
                    mechanic: string | null;
                    mechanicId: string | null;
                    vehiclePlate: string;
                    vehicleType: string | null;
                    customerName: string;
                    customerPhone: string | null;
                    complaints: string;
                    notes: string | null;
                    totalCost: number | null;
                    isPaid: boolean;
                })[] | ({
                    name: string;
                    id: string;
                    ownerId: string;
                    createdAt: Date;
                    updatedAt: Date;
                    phone: string | null;
                    specialization: string | null;
                    commissionRate: number;
                    isActive: boolean;
                } | {
                    name: string;
                    id: string;
                    ownerId: string;
                    createdAt: Date;
                    updatedAt: Date;
                    phone: string | null;
                    specialization: string | null;
                    commissionRate: number;
                    isActive: boolean;
                })[] | ({
                    id: string;
                    ownerId: string;
                    createdAt: Date;
                    date: Date;
                    mechanicId: string;
                    notes: string | null;
                    clockIn: Date | null;
                    clockOut: Date | null;
                    totalHours: number | null;
                } | {
                    id: string;
                    ownerId: string;
                    createdAt: Date;
                    date: Date;
                    mechanicId: string;
                    notes: string | null;
                    clockIn: Date | null;
                    clockOut: Date | null;
                    totalHours: number | null;
                })[] | ({
                    name: string;
                    id: string;
                    ownerId: string;
                    createdAt: Date;
                    updatedAt: Date;
                    phone: string | null;
                    address: string | null;
                    notes: string | null;
                    isActive: boolean;
                    contact: string | null;
                } | {
                    name: string;
                    id: string;
                    ownerId: string;
                    createdAt: Date;
                    updatedAt: Date;
                    phone: string | null;
                    address: string | null;
                    notes: string | null;
                    isActive: boolean;
                    contact: string | null;
                })[] | {
                    name: string | null;
                    id: string;
                    email: string;
                    googleId: string | null;
                    password: string | null;
                    image: string | null;
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
                    id: string;
                    ownerId: string;
                    createdAt: Date;
                    updatedAt: Date;
                    content: string | null;
                    title: string;
                    fileUrl: string;
                    fileType: string;
                }[] | {
                    name: string;
                    id: string;
                    ownerId: string;
                    createdAt: Date;
                    view360Url: string | null;
                }[] | {
                    name: string;
                    id: string;
                    ownerId: string;
                    createdAt: Date;
                    updatedAt: Date;
                    description: string | null;
                }[] | {
                    id: string;
                    ownerId: string;
                    createdAt: Date;
                    updatedAt: Date;
                    date: Date;
                }[] | {
                    id: string;
                    ownerId: string;
                    createdAt: Date;
                    updatedAt: Date;
                    status: string;
                    paymentMethod: string | null;
                    mechanic: string | null;
                    mechanicId: string | null;
                    vehiclePlate: string;
                    vehicleType: string | null;
                    customerName: string;
                    customerPhone: string | null;
                    complaints: string;
                    notes: string | null;
                    totalCost: number | null;
                    isPaid: boolean;
                }[] | {
                    name: string;
                    id: string;
                    ownerId: string;
                    createdAt: Date;
                    updatedAt: Date;
                    phone: string | null;
                    specialization: string | null;
                    commissionRate: number;
                    isActive: boolean;
                }[] | {
                    id: string;
                    ownerId: string;
                    createdAt: Date;
                    date: Date;
                    mechanicId: string;
                    notes: string | null;
                    clockIn: Date | null;
                    clockOut: Date | null;
                    totalHours: number | null;
                }[] | {
                    name: string;
                    id: string;
                    ownerId: string;
                    createdAt: Date;
                    updatedAt: Date;
                    phone: string | null;
                    address: string | null;
                    notes: string | null;
                    isActive: boolean;
                    contact: string | null;
                }[];
                [x: number]: never;
                [x: symbol]: never;
            } | null;
            staffRole: {
                name: string;
                id: string;
                ownerId: string;
                createdAt: Date;
                permissions: import("@prisma/client/runtime/library").JsonValue | null;
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
            } | null;
            memberOf: {
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
            } | null;
        } & {
            name: string | null;
            id: string;
            email: string;
            googleId: string | null;
            password: string | null;
            image: string | null;
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
            password: string | null;
            image: string | null;
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
     * Generate reset password token and send email
     */
    forgotPassword(email: string): Promise<{
        status: string;
        message: string;
    }>;
    /**
     * Validate reset password token without resetting password
     */
    validateResetToken(token: string): Promise<{
        status: string;
        valid: boolean;
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
                latitude?: number | null;
                longitude?: number | null;
                avatarVariant?: string | null;
                domain?: string;
                isApproved?: boolean;
                address?: string | null;
                googleMapsUrl?: string | null;
                ownerCode?: string | null;
                postalCode?: string | null;
            };
            memberOf: any;
            staffRole: any;
            phone: any;
            disabledMenus: any;
            isBlocked: any;
            avatarVariant: string | null;
            isApproved: any;
        };
    }>;
    /**
     * Resends the 2FA verification code to user email
     */
    resend2FA(userId: string): Promise<{
        status: string;
        message: string;
    }>;
}
//# sourceMappingURL=auth.service.d.ts.map