import type { Request, Response, NextFunction } from 'express';
import { Role } from '../types/auth.types.js';
/**
 * Middleware to check if user has required role(s)
 */
export declare function requireRole(...roles: Role[]): (req: Request, res: Response, next: NextFunction) => void;
/**
 * Middleware to ensure user is a regular USER
 */
export declare function requireUser(): (req: Request, res: Response, next: NextFunction) => void;
/**
 * Middleware to ensure user is an OWNER
 */
export declare function requireOwner(): (req: Request, res: Response, next: NextFunction) => void;
/**
 * Middleware to ensure user is an ADMIN
 */
export declare function requireAdmin(): (req: Request, res: Response, next: NextFunction) => void;
/**
 * Middleware to ensure user is either an OWNER or STAFF member
 */
export declare function requireStaffOrOwner(): (req: Request, res: Response, next: NextFunction) => void;
/**
 * Middleware to ensure OWNER can only access their own data
 * Validates that :ownerId parameter matches user's ownerId
 */
export declare function requireOwnData(): (req: Request, res: Response, next: NextFunction) => void;
/**
 * Middleware to ensure OWNER is approved
 */
export declare function requireApproved(): (req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=rbac.middleware.d.ts.map