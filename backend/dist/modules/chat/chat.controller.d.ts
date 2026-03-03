import type { Request, Response } from 'express';
export declare class ChatController {
    handleChat(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    getHistory(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    createSession(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    getSessionMessages(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    callStaff(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    stopStaff(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    acceptCall(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    declineCall(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    deleteSession(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    toggleSessionPin(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    clearHistory(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    getStoreStaff(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
}
//# sourceMappingURL=chat.controller.d.ts.map