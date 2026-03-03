export declare class ExpiryService {
    getExpiries(ownerId: string): Promise<({
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
            };
        } & {
            id: string;
            createdAt: Date;
            quantity: number | null;
            productId: string;
            productExpiryId: string;
        })[];
    } & {
        id: string;
        ownerId: string;
        createdAt: Date;
        updatedAt: Date;
        date: Date;
    })[]>;
    createExpiry(ownerId: string, date: Date): Promise<{
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
            };
        } & {
            id: string;
            createdAt: Date;
            quantity: number | null;
            productId: string;
            productExpiryId: string;
        })[];
    } & {
        id: string;
        ownerId: string;
        createdAt: Date;
        updatedAt: Date;
        date: Date;
    }>;
    deleteExpiry(ownerId: string, id: string): Promise<{
        id: string;
        ownerId: string;
        createdAt: Date;
        updatedAt: Date;
        date: Date;
    }>;
    assignProduct(productExpiryId: string, productId: string, ownerId: string, quantity?: number): Promise<{
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
        };
    } & {
        id: string;
        createdAt: Date;
        quantity: number | null;
        productId: string;
        productExpiryId: string;
    }>;
    removeProduct(productExpiryId: string, productId: string, ownerId: string): Promise<{
        id: string;
        createdAt: Date;
        quantity: number | null;
        productId: string;
        productExpiryId: string;
    }>;
}
//# sourceMappingURL=expiry.service.d.ts.map