import type { Request, Response, NextFunction } from 'express';
/**
 * Middleware to authenticate users via JWT token
 * Adds user data to req.user if token is valid
 */
export declare function authenticate(req: Request, res: Response, next: NextFunction): Promise<void>;
/**
 * Middleware to optionally authenticate users
 * If token is valid, req.user is populated.
 * If token is missing or invalid, req.user is undefined but request proceeds.
 */
export declare function authenticateOptional(req: Request, res: Response, next: NextFunction): Promise<void>;
//# sourceMappingURL=auth.middleware.d.ts.map