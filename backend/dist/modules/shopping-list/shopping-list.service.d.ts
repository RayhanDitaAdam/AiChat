export declare class ShoppingListService {
    /**
     * Get or create shopping list for a user
     */
    getOrCreateShoppingList(userId: string): Promise<{
        status: string;
        list: {
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
                createdAt: Date;
                shopping_list_id: string;
                product_id: string;
                quantity: number;
            })[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            user_id: string;
        };
    }>;
    /**
     * Add item to shopping list
     */
    addItem(userId: string, productId: string, quantity?: number): Promise<{
        status: string;
        list: {
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
                createdAt: Date;
                shopping_list_id: string;
                product_id: string;
                quantity: number;
            })[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            user_id: string;
        };
    }>;
    /**
     * Remove item from shopping list
     */
    removeItem(userId: string, itemId: string): Promise<{
        status: string;
        message: string;
    }>;
}
//# sourceMappingURL=shopping-list.service.d.ts.map