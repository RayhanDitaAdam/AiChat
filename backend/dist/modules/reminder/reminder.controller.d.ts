import type { Request, Response } from 'express';
export declare class ReminderController {
    /**
     * POST /api/reminder
     * Create a new reminder (User role only)
     */
    createReminder(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
}
//# sourceMappingURL=reminder.controller.d.ts.map