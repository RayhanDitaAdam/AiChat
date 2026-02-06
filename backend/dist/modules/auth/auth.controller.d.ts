import type { Request, Response } from 'express';
export declare class AuthController {
    /**
     * POST /api/auth/google
     * Authenticate with Google OAuth token
     */
    googleAuth(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * POST /api/auth/github
     * Authenticate with GitHub OAuth code
     */
    githubAuth(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * POST /api/auth/register
     * Register with email and password
     */
    register(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    verifyEmail(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * POST /api/auth/login
     * Login with email and password
     */
    login(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * GET /api/auth/me
     * Get current user profile
     */
    getProfile(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * PATCH /api/auth/profile
     * Update current user profile
     */
    updateProfile(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * POST /api/auth/refresh
     * Refresh access token using refresh token
     */
    refresh(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * GET /api/auth/stores
     */
    getStores(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * POST /api/auth/join-store
     */
    joinStore(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
}
//# sourceMappingURL=auth.controller.d.ts.map