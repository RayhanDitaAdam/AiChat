import type { Request, Response } from 'express';
export declare class OwnerController {
    /**
     * GET /api/missing-request/:ownerId
     * Get missing product requests for owner (Owner role only)
     */
    getMissingRequests(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * GET /api/ratings/:ownerId
     * Get ratings for owner (Owner role only)
     */
    getRatings(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * GET /api/chat-history/:ownerId
     * Get chat history for owner (Owner role only)
     */
    getChatHistory(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * GET /api/public/owners/:domain
     * Get owner details by domain (Public)
     */
    getPublicOwnerByDomain(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * GET /api/owner/live-support
     */
    getLiveSupportSessions(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * POST /api/owner/live-support/respond
     */
    respondToChat(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * GET /api/owner/live-support/:userId
     */
    getLiveChatHistory(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * PATCH /api/owner/settings
     */
    updateStoreSettings(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    getStoreMembers(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    updateMemberRole(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * POST /api/owner/staff
     */
    createStaff(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    getStaffRoles(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    createStaffRole(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    deleteStaffRole(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
}
//# sourceMappingURL=owner.controller.d.ts.map