import type { Request, Response } from 'express';
export declare const getRewards: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const createReward: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const redeemReward: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=reward.controller.d.ts.map