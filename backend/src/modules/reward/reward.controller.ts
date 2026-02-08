import type { Request, Response } from 'express';
import * as rewardService from './reward.service.js';

export const getRewards = async (req: Request, res: Response) => {
    try {
        const ownerId = (req as any).user.ownerId;
        if (!ownerId) return res.status(403).json({ status: 'error', message: 'Owner context required' });

        const rewards = await rewardService.getRewards(ownerId);
        res.status(200).json({ status: 'success', data: rewards });
    } catch (err: any) {
        res.status(500).json({ status: 'error', message: err.message });
    }
};

export const createReward = async (req: Request, res: Response) => {
    try {
        const ownerId = (req as any).user.ownerId;
        if (!ownerId) return res.status(403).json({ status: 'error', message: 'Owner context required' });

        const reward = await rewardService.createReward(req.body, ownerId);
        res.status(201).json({ status: 'success', data: reward });
    } catch (err: any) {
        res.status(500).json({ status: 'error', message: err.message });
    }
};

export const redeemReward = async (req: Request, res: Response) => {
    try {
        const ownerId = (req as any).user.ownerId;
        if (!ownerId) return res.status(403).json({ status: 'error', message: 'Owner context required' });

        const { memberId, rewardId } = req.body;
        const result = await rewardService.redeemReward(memberId, rewardId, ownerId);
        res.status(200).json({ status: 'success', data: result });
    } catch (err: any) {
        res.status(400).json({ status: 'error', message: err.message });
    }
};
