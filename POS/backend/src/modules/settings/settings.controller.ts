import { Request, Response } from 'express';
import * as settingsService from './settings.service.js';

export const getSettings = async (_req: Request, res: Response) => {
    try {
        const settings = await settingsService.getSettings();
        res.status(200).json({ status: 'success', data: settings });
    } catch (err: any) {
        res.status(500).json({ status: 'error', message: err.message });
    }
};

export const updateSettings = async (req: Request, res: Response) => {
    try {
        const settings = await settingsService.updateSettings(req.body);
        res.status(200).json({ status: 'success', data: settings });
    } catch (err: any) {
        res.status(500).json({ status: 'error', message: err.message });
    }
};
