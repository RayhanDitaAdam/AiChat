import type { Request, Response } from 'express';
export declare const createTransaction: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getTransactions: (req: Request, res: Response) => Promise<void>;
export declare const getTransactionById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=transaction.controller.d.ts.map