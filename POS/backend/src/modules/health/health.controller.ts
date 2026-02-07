import { Request, Response } from 'express';
import * as healthService from './health.service.js';

export const saveMedicalRecord = async (req: Request, res: Response) => {
    try {
        const { memberId, content } = req.body;
        const filePath = req.file?.path;

        let data;
        if (filePath) {
            data = await healthService.processMedicalRecord(memberId, filePath);
        } else {
            data = await healthService.saveMedicalRecord(memberId, content);
        }

        res.status(201).json({ status: 'success', data });
    } catch (error: any) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

export const analyzeFood = async (req: Request, res: Response) => {
    try {
        const { memberId, text } = req.body;
        const filePath = req.file?.path;

        const data = await healthService.analyzeFood(memberId, filePath, text);
        res.status(200).json({ status: 'success', data });
    } catch (error: any) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

export const getHealthHistory = async (req: Request, res: Response) => {
    try {
        const { memberId } = req.params;
        const data = await healthService.getHealthHistory(memberId as string);
        res.status(200).json({ status: 'success', data });
    } catch (error: any) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};
