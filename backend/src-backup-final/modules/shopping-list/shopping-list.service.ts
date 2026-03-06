import { prisma } from '../../common/services/prisma.service.js';

export class ShoppingListService {
    /**
     * Get or create shopping list for a user
     */
    async getOrCreateShoppingList(userId: string) {
        try {
            const list = await prisma.shoppingList.upsert({
                where: { user_id: userId },
                create: { user_id: userId },
                update: {},
                include: {
                    items: {
                        include: {
                            product: true
                        },
                        orderBy: { createdAt: 'desc' }
                    }
                }
            });

            return {
                status: 'success',
                list
            };
        } catch (error: any) {
            // Handle race condition: if another request created the list between our check and create
            if (error.code === 'P2002') {
                const list = await prisma.shoppingList.findUnique({
                    where: { user_id: userId },
                    include: {
                        items: {
                            include: {
                                product: true
                            },
                            orderBy: { createdAt: 'desc' }
                        }
                    }
                });

                if (!list) throw new Error('Failed to retrieve shopping list after creation conflict');

                return {
                    status: 'success',
                    list
                };
            }
            throw error;
        }
    }

    /**
     * Add item to shopping list
     */
    async addItem(userId: string, productId: string, quantity: number = 1) {
        const { list } = await this.getOrCreateShoppingList(userId);
        if (!list) throw new Error('Shopping list not found');

        // Check if product already exists in list
        const existingItem = await prisma.shoppingListItem.findFirst({
            where: {
                shopping_list_id: list.id,
                product_id: productId
            }
        });

        if (existingItem) {
            await prisma.shoppingListItem.update({
                where: { id: existingItem.id },
                data: { quantity: existingItem.quantity + quantity }
            });
        } else {
            await prisma.shoppingListItem.create({
                data: {
                    shopping_list_id: list.id,
                    product_id: productId,
                    quantity
                }
            });
        }

        return this.getOrCreateShoppingList(userId);
    }

    /**
     * Remove item from shopping list
     */
    async removeItem(userId: string, itemId: string) {
        const { list } = await this.getOrCreateShoppingList(userId);
        if (!list) throw new Error('Shopping list not found');

        await prisma.shoppingListItem.delete({
            where: {
                id: itemId,
                shopping_list_id: list.id // Security check
            }
        });

        return {
            status: 'success',
            message: 'Item removed from shopping list'
        };
    }
}
