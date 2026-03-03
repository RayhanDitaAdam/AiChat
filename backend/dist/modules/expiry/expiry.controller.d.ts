import type { Request, Response } from 'express';
export declare class ExpiryController {
    private expiryService;
    constructor();
    getExpiries(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    createExpiry(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    deleteExpiry(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    assignProduct(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    removeProduct(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
}
//# sourceMappingURL=expiry.controller.d.ts.map