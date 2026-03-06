
import * as rewardService from './reward.service.js';

export const getRewards = async (req, res) => {
    try {
        const ownerId = (req ).user.ownerId;
        if (!ownerId) return res.status(403).json({ status: 'error', message: 'Owner context required' });

        const rewards = await rewardService.getRewards(ownerId);
        res.status(200).json({ status: 'success', data: rewards });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
};

export const createReward = async (req, res) => {
    try {
        const ownerId = (req ).user.ownerId;
        if (!ownerId) return res.status(403).json({ status: 'error', message: 'Owner context required' });

        const reward = await rewardService.createReward(req.body, ownerId);
        res.status(201).json({ status: 'success', data: reward });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
};

export const redeemReward = async (req, res) => {
    try {
        const ownerId = (req ).user.ownerId;
        if (!ownerId) return res.status(403).json({ status: 'error', message: 'Owner context required' });

        const { memberId, rewardId } = req.body;
        const result = await rewardService.redeemReward(memberId, rewardId, ownerId);
        res.status(200).json({ status: 'success', data: result });
    } catch (err) {
        res.status(400).json({ status: 'error', message: err.message });
    }
};
