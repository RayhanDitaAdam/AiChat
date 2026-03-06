import type { Request, Response } from 'express';
import { ShoppingListService } from './shopping-list.service.js';

const shoppingListService = new ShoppingListService();

export class ShoppingListController {
    /**
     * GET /api/shopping-list
     */
    async getList(req: Request, res: Response) {
        try {
            if (!req.user) return res.status(401).json({ status: 'error', message: 'Unauthorized' });
            const result = await shoppingListService.getOrCreateShoppingList(req.user.id);
            return res.json(result);
        } catch (error) {
            console.error('Get Shopping List Error:', error);
            return res.status(500).json({
                status: 'error',
                message: error instanceof Error ? error.message : 'Failed to fetch shopping list',
                details: process.env.NODE_ENV === 'development' ? error : undefined
            });
        }
    }

    /**
     * POST /api/shopping-list/items
     */
    async addItem(req: Request, res: Response) {
        try {
            if (!req.user) return res.status(401).json({ status: 'error', message: 'Unauthorized' });
            const { productId, quantity } = req.body;
            const result = await shoppingListService.addItem(req.user.id, productId, quantity);
            return res.json(result);
        } catch (error) {
            console.error('Add Item Error:', error);
            return res.status(500).json({ status: 'error', message: 'Failed to add item to list' });
        }
    }

    /**
     * DELETE /api/shopping-list/items/:itemId
     */
    async removeItem(req: Request, res: Response) {
        try {
            if (!req.user) return res.status(401).json({ status: 'error', message: 'Unauthorized' });
            const { itemId } = req.params;
            if (!itemId) return res.status(400).json({ status: 'error', message: 'Item ID is required' });
            const result = await shoppingListService.removeItem(req.user.id, itemId as string);
            return res.json(result);
        } catch (error) {
            console.error('Remove Item Error:', error);
            return res.status(500).json({ status: 'error', message: 'Failed to remove item' });
        }
    }
}
