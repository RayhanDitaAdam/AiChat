import type { Request, Response, NextFunction } from 'express';
/**
 * Middleware to limit the maximum value of generic pagination/query parameters like 'limit' or 'take'.
 * This prevents clients from requesting excessively large result sets that could overload the DB or memory.
 */
export declare const queryLimiter: (options?: {
    maxLimit: number;
    defaultLimit: number;
}) => (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=query-limiter.middleware.d.ts.map