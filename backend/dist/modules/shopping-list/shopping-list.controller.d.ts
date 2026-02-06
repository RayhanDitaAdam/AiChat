import type { Request, Response } from 'express';
export declare class ShoppingListController {
    /**
     * GET /api/shopping-list
     */
    getList(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * POST /api/shopping-list/items
     */
    addItem(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * DELETE /api/shopping-list/items/:itemId
     */
    removeItem(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
}
//# sourceMappingURL=shopping-list.controller.d.ts.map