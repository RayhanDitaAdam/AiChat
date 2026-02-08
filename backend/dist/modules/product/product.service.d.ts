export declare class ProductService {
    /**
     * Get all products by owner ID
     * Users can access any owner's products
     * Owners can only access their own products (enforced by middleware)
     */
    getProductsByOwner(ownerId: string): Promise<{
        status: string;
        owner: {
            id: string;
            name: string;
            domain: string;
        };
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
        }[];
    }>;
    createProduct(ownerId: string, data: any): Promise<{
        status: string;
        message: string;
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
    }>;
    updateProduct(productId: string, ownerId: string, data: any): Promise<{
        status: string;
        message: string;
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
    }>;
    deleteProduct(productId: string, ownerId: string): Promise<{
        status: string;
        message: string;
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
            id: string;
            owner_id: string;
            product_name: string;
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