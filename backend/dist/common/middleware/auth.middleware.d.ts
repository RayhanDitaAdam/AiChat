import type { Request, Response, NextFunction } from 'express';
/**
 * Middleware to authenticate users via JWT token
 * Adds user data to req.user if token is valid
 */
export declare function authenticate(req: Request, res: Response, next: NextFunction): Promise<void>;
//# sourceMappingURL=auth.middleware.d.ts.map