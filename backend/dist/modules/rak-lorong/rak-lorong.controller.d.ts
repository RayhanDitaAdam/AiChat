import type { Request, Response } from 'express';
export declare const getLorongs: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const createLorong: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const createRak: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const deleteLorong: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const deleteRak: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=rak-lorong.controller.d.ts.map