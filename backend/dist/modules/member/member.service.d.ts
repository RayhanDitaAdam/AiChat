export declare const getMembers: (search?: string) => Promise<{
    name: string | null;
    id: string;
    email: string;
    createdAt: Date;
    phone: string | null;
    username: string | null;
    dob: Date | null;
    points: number;
}[]>;
export declare const getMemberDetail: (id: string) => Promise<({
    myTransactions: ({
        items: ({
            product: {
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
            };
        } & {
            id: string;
            price: number;
            productId: string;
            quantity: number;
            transactionId: string;
        })[];
    } & {
        id: string;
        ownerId: string;
        createdAt: Date;
        total: number;
        discount: number;
        paymentMethod: string;
        memberId: string | null;
        cashierId: string;
    })[];
    posPointHistory: {
        id: string;
        createdAt: Date;
        amount: number;
        description: string | null;
        type: string;
        memberId: string;
    }[];
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
    username: string | null;
    dob: Date | null;
    points: number;
}) | null>;
//# sourceMappingURL=member.service.d.ts.map