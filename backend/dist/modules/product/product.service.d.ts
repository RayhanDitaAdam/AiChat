export declare class ProductService {
    /**
     * Get all products by owner ID
     * Users can access any owner's products
     * Owners can only access their own products (enforced by middleware)
     */
    getProductsByOwner(ownerId: string, search?: string, data?: {
        status?: string;
    }): Promise<{
        status: string;
        owner: {
            id: string;
            name: string;
            domain: string;
        };
        products: ({
            contributor: {
                name: string | null;
            } | null;
        } & {
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
        })[];
    }>;
    createProduct(ownerId: string, data: any, contributorId?: string): Promise<{
        status: string;
        message: string;
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
    }>;
    updateProduct(productId: string, ownerId: string, data: any, contributorId?: string): Promise<{
        status: string;
        message: string;
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
    }>;
    deleteProduct(productId: string, ownerId: string, contributorId?: string): Promise<{
        status: string;
        message: string;
    }>;
    updateProductStatus(productId: string, ownerId: string, status: 'APPROVED' | 'REJECTED'): Promise<{
        status: string;
        message: string;
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
    }>;
    bulkUpdateProductStatus(productIds: string[], ownerId: string, status: 'APPROVED' | 'REJECTED'): Promise<{
        status: string;
        message: string;
        count: number;
    }>;
    bulkCreateProducts(ownerId: string, productsData: any[]): Promise<{
        status: string;
        message: string;
        count: number;
    }>;
    /**
     * Identify fast-moving products based on MissingRequests and ShoppingList usage
     */
    identifyFastMovingProducts(ownerId: string): Promise<{
        status: string;
        fastMoving: {
            id: string;
            name: string;
            stock: number;
            intentCount: number;
            reason: string;
        }[];
        demandedFromMissing: {
            query: string;
            id: string;
            ownerId: string;
            createdAt: Date;
            updatedAt: Date;
            status: string;
            count: number;
        }[];
    }>;
    createProductPromo(ownerId: string, data: any): Promise<{
        status: string;
        message: string;
        promo: any;
    }>;
    getPromosByOwner(ownerId: string): Promise<{
        status: string;
        promos: any;
    }>;
}
//# sourceMappingURL=product.service.d.ts.map