import type { Request, Response } from 'express';
export declare class StatController {
    getGlobalStats(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    getOwnerStats(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
}
//# sourceMappingURL=stat.controller.d.ts.map