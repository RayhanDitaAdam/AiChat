import { Request, Response } from 'express';
import * as rewardService from './reward.service.js';

export const getRewards = async (_req: Request, res: Response) => {
    try {
        const rewards = await rewardService.getRewards();
        res.status(200).json({ status: 'success', data: rewards });
    } catch (err: any) {
        res.status(500).json({ status: 'error', message: err.message });
    }
};

export const createReward = async (req: Request, res: Response) => {
    try {
        const reward = await rewardService.createReward(req.body);
        res.status(201).json({ status: 'success', data: reward });
    } catch (err: any) {
        res.status(500).json({ status: 'error', message: err.message });
    }
};

export const redeemReward = async (req: Request, res: Response) => {
    try {
        const { memberId, rewardId } = req.body;
        const result = await rewardService.redeemReward(memberId, rewardId);
        res.status(200).json({ status: 'success', data: result });
    } catch (err: any) {
        res.status(400).json({ status: 'error', message: err.message });
    }
};
