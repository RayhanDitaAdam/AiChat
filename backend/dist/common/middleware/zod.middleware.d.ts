import type { NextFunction, Request, Response } from 'express';
import { ZodType } from 'zod';
export declare const validate: (schema: ZodType<any>) => (req: Request, res: Response, next: NextFunction) => Promise<void | Response<any, Record<string, any>>>;
//# sourceMappingURL=zod.middleware.d.ts.map