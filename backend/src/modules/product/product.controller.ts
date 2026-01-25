import type { Request, Response } from 'express';
import { ProductService } from './product.service.js';

const productService = new ProductService();

export class ProductController {
    /**
     * GET /api/products/:ownerId
     * Get products by owner ID
     */
    async getProductsByOwner(req: Request, res: Response) {
        try {
            const ownerId = req.params.ownerId as string;
            const result = await productService.getProductsByOwner(ownerId);
            return res.json(result);
        } catch (error) {
            console.error('Get Products Controller Error:', error);
            return res.status(404).json({
                status: 'error',
                message: error instanceof Error ? error.message : 'Failed to fetch products'
            });
        }
    }

    /**
     * POST /api/products
     * Create new product (Owner only)
     */
    async createProduct(req: Request, res: Response) {
        try {
            if (!req.user || req.user.role !== 'OWNER' || !req.user.ownerId) {
                return res.status(403).json({
                    status: 'error',
                    message: 'Only owners can create products'
                });
            }

            const result = await productService.createProduct(req.user.ownerId, req.body);
            return res.status(201).json(result);
        } catch (error) {
            console.error('Create Product Controller Error:', error);
            return res.status(500).json({
                status: 'error',
                message: error instanceof Error ? error.message : 'Failed to create product'
            });
        }
    }

    /**
     * PATCH /api/products/:id
     * Update existing product (Owner only)
     */
    async updateProduct(req: Request, res: Response) {
        try {
            if (!req.user || req.user.role !== 'OWNER' || !req.user.ownerId) {
                return res.status(403).json({
                    status: 'error',
                    message: 'Only owners can update products'
                });
            }

            const productId = req.params.id as string;
            const result = await productService.updateProduct(productId, req.user.ownerId, req.body);
            return res.json(result);
        } catch (error) {
            console.error('Update Product Controller Error:', error);
            return res.status(500).json({
                status: 'error',
                message: error instanceof Error ? error.message : 'Failed to update product'
            });
        }
    }

    /**
     * DELETE /api/products/:id
     * Delete product (Owner only)
     */
    async deleteProduct(req: Request, res: Response) {
        try {
            if (!req.user || req.user.role !== 'OWNER' || !req.user.ownerId) {
                return res.status(403).json({
                    status: 'error',
                    message: 'Only owners can delete products'
                });
            }

            const productId = req.params.id as string;
            const result = await productService.deleteProduct(productId, req.user.ownerId);
            return res.json(result);
        } catch (error) {
            console.error('Delete Product Controller Error:', error);
            return res.status(500).json({
                status: 'error',
                message: error instanceof Error ? error.message : 'Failed to delete product'
            });
        }
    }
}
