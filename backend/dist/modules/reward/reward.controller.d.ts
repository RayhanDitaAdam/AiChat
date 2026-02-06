import type { Request, Response } from 'express';
export declare class RewardController {
    issueReward(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    processQRTransaction(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    getMyActivities(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * Export members or users to CSV
     */
    exportToCSV(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
}
//# sourceMappingURL=reward.controller.d.ts.map