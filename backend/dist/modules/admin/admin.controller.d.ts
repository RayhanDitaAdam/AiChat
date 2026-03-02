import type { Request, Response } from 'express';
export declare class AdminController {
    private adminService;
    getStats(req: Request, res: Response): Promise<void>;
    getMissingRequests(req: Request, res: Response): Promise<void>;
    getOwners(req: Request, res: Response): Promise<void>;
    approveOwner(req: Request, res: Response): Promise<void>;
    updateOwnerConfig(req: Request, res: Response): Promise<void>;
    updateOwnerCategory(req: Request, res: Response): Promise<void>;
    updateOwner(req: Request, res: Response): Promise<void>;
    createOwner(req: Request, res: Response): Promise<void>;
    deleteOwner(req: Request, res: Response): Promise<void>;
    getSystemConfig(req: Request, res: Response): Promise<void>;
    updateSystemConfig(req: Request, res: Response): Promise<void>;
    getUsers(req: Request, res: Response): Promise<void>;
    updateUserMenus(req: Request, res: Response): Promise<void>;
    toggleUserBlock(req: Request, res: Response): Promise<void>;
    getAdmins(req: Request, res: Response): Promise<void>;
    createAdmin(req: Request, res: Response): Promise<void>;
    updateAdmin(req: Request, res: Response): Promise<void>;
    deleteAdmin(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=admin.controller.d.ts.map