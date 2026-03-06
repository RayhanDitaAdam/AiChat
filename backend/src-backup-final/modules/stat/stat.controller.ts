import type { Request, Response } from 'express';
import { StatService } from './stat.service.js';

const statService = new StatService();

export class StatController {
    async getGlobalStats(req: Request, res: Response) {
        try {
            if (!req.user || req.user.role !== 'ADMIN') {
                return res.status(403).json({ status: 'error', message: 'Admin access required' });
            }
            const result = await statService.getGlobalStats();
            return res.json(result);
        } catch (error: any) {
            return res.status(500).json({ status: 'error', message: error.message });
        }
    }

    async getOwnerStats(req: Request, res: Response) {
        try {
            if (!req.user || req.user.role !== 'OWNER' || !req.user.ownerId) {
                return res.status(403).json({ status: 'error', message: 'Owner access required' });
            }
            const result = await statService.getOwnerStats(req.user.ownerId);
            return res.json(result);
        } catch (error: any) {
            return res.status(500).json({ status: 'error', message: error.message });
        }
    }
}
