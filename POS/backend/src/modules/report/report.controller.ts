import { Request, Response } from 'express';
import * as reportService from './report.service.js';

export const getSalesAnalytics = async (req: Request, res: Response) => {
    try {
        const { period } = req.query;
        const data = await reportService.getSalesAnalytics(period as 'daily' | 'monthly');
        res.status(200).json({ status: 'success', data });
    } catch (error: any) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

export const getTopSellingProducts = async (req: Request, res: Response) => {
    try {
        const { limit } = req.query;
        const data = await reportService.getTopSellingProducts(Number(limit) || 5);
        res.status(200).json({ status: 'success', data });
    } catch (error: any) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

export const getStockAlerts = async (req: Request, res: Response) => {
    try {
        const { threshold } = req.query;
        const data = await reportService.getStockAlerts(Number(threshold) || 10);
        res.status(200).json({ status: 'success', data });
    } catch (error: any) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};
