import type { Request, Response } from 'express';
export declare class SopController {
    private sopService;
    constructor();
    uploadSop(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getSops(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    deleteSop(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    updateSopText(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
}
//# sourceMappingURL=sop.controller.d.ts.map