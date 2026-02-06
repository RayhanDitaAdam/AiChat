import type { Request, Response } from 'express';
export declare class RatingController {
    /**
     * POST /api/rating
     * Create a new rating (User role only)
     */
    createRating(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
}
//# sourceMappingURL=rating.controller.d.ts.map