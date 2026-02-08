import type { Request, Response } from 'express';
import * as transactionService from './transaction.service.js';

export const createTransaction = async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        if (!user) return res.status(401).json({ status: 'error', message: 'Unauthorized' });

        const data = await transactionService.createTransaction(req.body, user.id);
        res.status(201).json({ status: 'success', data });
    } catch (error: any) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

export const getTransactions = async (req: Request, res: Response) => {
    try {
        const data = await transactionService.getTransactions(req.query);
        res.status(200).json({ status: 'success', data });
    } catch (error: any) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

export const getTransactionById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const data = await transactionService.getTransactionById(id as string);
        if (!data) return res.status(404).json({ status: 'error', message: 'Transaction not found' });
        res.status(200).json({ status: 'success', data });
    } catch (error: any) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};
