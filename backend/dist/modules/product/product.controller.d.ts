import type { Request, Response } from 'express';
export declare class ProductController {
    /**
     * POST /api/products/upload
     * Bulk upload products via Excel (Owner only)
     */
    uploadProducts(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * GET /api/products/:ownerId
     * Get products by owner ID
     */
    getProductsByOwner(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * GET /api/products
     * Get products for the current user's store
     */
    getProducts(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * GET /api/products/owner/pending
     * Get all pending products for the owner to review
     */
    getPendingProducts(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * PATCH /api/products/approval/:id
     * Approve or reject a product submission
     */
    updateProductStatus(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * PATCH /api/products/approval/bulk
     * Approve or reject multiple products
     */
    bulkUpdateProductStatus(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * POST /api/products
     * Create new product (Owner only)
     */
    createProduct(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * PATCH /api/products/:id
     * Update existing product (Owner only)
     */
    updateProduct(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * DELETE /api/products/:id
     * Delete product (Owner only)
     */
    /**
     * DELETE /api/products/:id
     * Delete product (Owner only)
     */
    deleteProduct(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * GET /api/products/owner/forecasting
     */
    getProductForecasting(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * POST /api/products/owner/promos
     */
    createPromo(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * GET /api/products/owner/promos
     */
    getPromos(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
}
//# sourceMappingURL=product.controller.d.ts.map