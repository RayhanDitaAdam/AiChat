import type { Request, Response } from 'express';
import * as reportService from './report.service.js';

export const getSalesAnalytics = async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        const effectiveStoreId = user?.ownerId || user?.memberOfId;

        if (!user || !effectiveStoreId) return res.status(401).json({ status: 'error', message: 'Unauthorized' });

        const contributorId = user.role === 'CONTRIBUTOR' ? user.id : undefined;
        const { period } = req.query;
        const data = await reportService.getSalesAnalytics(effectiveStoreId, period as 'daily' | 'monthly', contributorId);
        res.status(200).json({ status: 'success', data });
    } catch (error: any) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

export const getComprehensiveReport = async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        const effectiveStoreId = user?.ownerId || user?.memberOfId;

        if (!user || !effectiveStoreId) return res.status(401).json({ status: 'error', message: 'Unauthorized' });

        const contributorId = user.role === 'CONTRIBUTOR' ? user.id : undefined;
        const { startDate, endDate } = req.query;

        const data = await reportService.getComprehensiveReport(
            effectiveStoreId,
            startDate as string,
            endDate as string,
            contributorId
        );

        res.status(200).json({ status: 'success', data });
    } catch (error: any) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

export const getTopSellingProducts = async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        const effectiveStoreId = user?.ownerId || user?.memberOfId;

        if (!user || !effectiveStoreId) return res.status(401).json({ status: 'error', message: 'Unauthorized' });

        const contributorId = user.role === 'CONTRIBUTOR' ? user.id : undefined;
        const { limit } = req.query;
        const data = await reportService.getTopSellingProducts(effectiveStoreId, Number(limit) || 5, contributorId);
        res.status(200).json({ status: 'success', data });
    } catch (error: any) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

export const getStockAlerts = async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        const effectiveStoreId = user?.ownerId || user?.memberOfId;

        if (!user || !effectiveStoreId) return res.status(401).json({ status: 'error', message: 'Unauthorized' });

        const contributorId = user.role === 'CONTRIBUTOR' ? user.id : undefined;
        const { threshold } = req.query;
        const data = await reportService.getStockAlerts(effectiveStoreId, Number(threshold) || 10, contributorId);
        res.status(200).json({ status: 'success', data });
    } catch (error: any) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};
