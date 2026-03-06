import type { Request, Response } from 'express';
import { ExpiryService } from './expiry.service.js';

export class ExpiryController {
    private expiryService: ExpiryService;

    constructor() {
        this.expiryService = new ExpiryService();
    }

    async getExpiries(req: Request, res: Response) {
        try {
            const ownerId = req.user?.ownerId || req.user?.id;
            if (!ownerId) {
                return res.status(403).json({ success: false, message: 'Unauthorized access' });
            }

            const expiries = await this.expiryService.getExpiries(ownerId);
            res.json({ success: true, data: expiries });
        } catch (error: any) {
            console.error('Get Expiries Error:', error);
            res.status(500).json({ success: false, message: error.message || 'Failed to fetch expiries' });
        }
    }

    async createExpiry(req: Request, res: Response) {
        try {
            const ownerId = req.user?.ownerId || req.user?.id;
            if (!ownerId) {
                return res.status(403).json({ success: false, message: 'Unauthorized access' });
            }

            const { date } = req.body;
            if (!date) {
                return res.status(400).json({ success: false, message: 'Date is required' });
            }

            const expiry = await this.expiryService.createExpiry(ownerId, new Date(date));
            res.status(201).json({ success: true, data: expiry });
        } catch (error: any) {
            console.error('Create Expiry Error:', error);
            res.status(500).json({ success: false, message: error.message || 'Failed to create expiry grouping' });
        }
    }

    async deleteExpiry(req: Request, res: Response) {
        try {
            const ownerId = req.user?.ownerId || req.user?.id;
            const { id } = req.params;

            if (!ownerId || !id) {
                return res.status(400).json({ success: false, message: 'Invalid parameters' });
            }

            await this.expiryService.deleteExpiry(ownerId, id as string);
            res.json({ success: true, message: 'Expiry group deleted successfully' });
        } catch (error: any) {
            console.error('Delete Expiry Error:', error);
            res.status(500).json({ success: false, message: error.message || 'Failed to delete expiry' });
        }
    }

    async assignProduct(req: Request, res: Response) {
        try {
            const ownerId = req.user?.ownerId || req.user?.id;
            const { id: productExpiryId } = req.params;
            const { productId, quantity } = req.body;

            if (!ownerId || !productExpiryId || !productId) {
                return res.status(400).json({ success: false, message: 'Invalid parameters' });
            }

            const item = await this.expiryService.assignProduct(productExpiryId as string, productId, ownerId, quantity);
            res.status(201).json({ success: true, data: item });
        } catch (error: any) {
            console.error('Assign Product Error:', error);
            res.status(500).json({ success: false, message: error.message || 'Failed to assign product' });
        }
    }

    async removeProduct(req: Request, res: Response) {
        try {
            const ownerId = req.user?.ownerId || req.user?.id;
            const { id: productExpiryId, productId } = req.params;

            if (!ownerId || !productExpiryId || !productId) {
                return res.status(400).json({ success: false, message: 'Invalid parameters' });
            }

            await this.expiryService.removeProduct(productExpiryId as string, productId as string, ownerId);
            res.json({ success: true, message: 'Product removed from expiry group' });
        } catch (error: any) {
            console.error('Remove Product Error:', error);
            res.status(500).json({ success: false, message: error.message || 'Failed to remove product' });
        }
    }
}
