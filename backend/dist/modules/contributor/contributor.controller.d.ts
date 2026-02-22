import type { Request, Response } from "express";
export declare const createRequest: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getPendingRequests: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const updateRequestStatus: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const listContributors: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getMyRequests: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const deleteRequest: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=contributor.controller.d.ts.map