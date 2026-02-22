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
    memberId: string | null;
    total: number;
    discount: number;
    paymentMethod: string;
    cashierId: string;
}>;
export declare const getTransactions: (filters: any) => Promise<({
    items: ({
        product: {
            name: string;
            contributorId: string | null;
        };
    } & {
        id: string;
        price: number;
        quantity: number;
        productId: string;
        transactionId: string;
    })[];
    cashier: {
        name: string | null;
    };
    member: {
        name: string | null;
        phone: string | null;
    } | null;
} & {
    id: string;
    ownerId: string;
    createdAt: Date;
    memberId: string | null;
    total: number;
    discount: number;
    paymentMethod: string;
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
            status: string;
            description: string | null;
            price: number;
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
        };
    } & {
        id: string;
        price: number;
        quantity: number;
        productId: string;
        transactionId: string;
    })[];
    cashier: {
        name: string | null;
    };
    member: {
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
    } | null;
} & {
    id: string;
    ownerId: string;
    createdAt: Date;
    memberId: string | null;
    total: number;
    discount: number;
    paymentMethod: string;
    cashierId: string;
}) | null>;
//# sourceMappingURL=transaction.service.d.ts.map