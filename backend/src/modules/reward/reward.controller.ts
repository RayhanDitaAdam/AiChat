import type { Request, Response } from 'express';
import { RewardService } from './reward.service.js';
import { prisma } from '../../common/services/prisma.service.js';
import { Parser } from 'json2csv';

const rewardService = new RewardService();

export class RewardController {
    async issueReward(req: Request, res: Response) {
        try {
            if (!req.user || req.user.role !== 'OWNER' || !req.user.ownerId) {
                return res.status(403).json({ status: 'error', message: 'Forbidden' });
            }
            const result = await rewardService.issueReward(req.user.ownerId, req.body);
            return res.json(result);
        } catch (error: any) {
            return res.status(500).json({ status: 'error', message: error.message });
        }
    }

    async processQRTransaction(req: Request, res: Response) {
        try {
            if (!req.user || req.user.role !== 'OWNER' || !req.user.ownerId) {
                return res.status(403).json({ status: 'error', message: 'Forbidden' });
            }
            const result = await rewardService.processQRTransaction(req.user.ownerId, req.body);
            return res.json(result);
        } catch (error: any) {
            return res.status(500).json({ status: 'error', message: error.message });
        }
    }

    async getMyActivities(req: Request, res: Response) {
        try {
            if (!req.user) return res.status(401).json({ status: 'error', message: 'Unauthorized' });
            const result = await rewardService.getMemberActivities(req.user.id);
            return res.json(result);
        } catch (error: any) {
            return res.status(500).json({ status: 'error', message: error.message });
        }
    }

    /**
     * Export members or users to CSV
     */
    async exportToCSV(req: Request, res: Response) {
        try {
            if (!req.user || req.user.role !== 'OWNER' || !req.user.ownerId) {
                return res.status(403).json({ status: 'error', message: 'Forbidden' });
            }

            const { type } = req.query; // 'user' or 'member'

            const users = await prisma.user.findMany({
                where: {
                    memberOfId: req.user.ownerId,
                    registrationType: type === 'member' ? 'MEMBER' : 'USER'
                },
                select: {
                    email: true,
                    name: true,
                    phone: true,
                    loyaltyPoints: true,
                    registrationType: true,
                    customerId: true,
                    createdAt: true
                }
            });

            if (users.length === 0) {
                return res.status(404).json({ status: 'error', message: 'No records found to export' });
            }

            const json2csvParser = new Parser();
            const csv = json2csvParser.parse(users);

            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename=${type}s_export.csv`);
            return res.status(200).send(csv);
        } catch (error: any) {
            console.error('CSV Export Error:', error);
            return res.status(500).json({ status: 'error', message: 'Failed to export CSV' });
        }
    }
}
