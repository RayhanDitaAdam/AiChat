export declare const createTransaction: (data: any, cashierId: string) => Promise<{
    items: {
        id: string;
        price: number;
        quantity: number;
        productId: string;
        transactionId: string;
    }[];
} & {
    id: string;
    ownerId: string;
    createdAt: Date;
    total: number;
    discount: number;
    paymentMethod: string;
    memberId: string | null;
    cashierId: string;
}>;
export declare const getTransactions: (filters: any) => Promise<({
    items: ({
        product: {
            name: string;
        };
    } & {
        id: string;
        price: number;
        quantity: number;
        productId: string;
        transactionId: string;
    })[];
    member: {
        name: string | null;
        phone: string | null;
    } | null;
    cashier: {
        name: string | null;
    };
} & {
    id: string;
    ownerId: string;
    createdAt: Date;
    total: number;
    discount: number;
    paymentMethod: string;
    memberId: string | null;
    cashierId: string;
})[]>;
export declare const getTransactionById: (id: string) => Promise<({
    items: ({
        product: {
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
        };
    } & {
        id: string;
        price: number;
        quantity: number;
        productId: string;
        transactionId: string;
    })[];
    member: {
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
    } | null;
    cashier: {
        name: string | null;
    };
} & {
    id: string;
    ownerId: string;
    createdAt: Date;
    total: number;
    discount: number;
    paymentMethod: string;
    memberId: string | null;
    cashierId: string;
}) | null>;
//# sourceMappingURL=transaction.service.d.ts.map