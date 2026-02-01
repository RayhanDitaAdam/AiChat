import type { Request, Response } from 'express';
import { AdminService } from './admin.service.js';

export class AdminController {
    private adminService = new AdminService();

    async getStats(req: Request, res: Response) {
        try {
            const stats = await this.adminService.getStats();
            res.json({ status: 'success', data: stats });
        } catch (error: any) {
            res.status(500).json({ status: 'error', message: error.message });
        }
    }

    async getMissingRequests(req: Request, res: Response) {
        try {
            const requests = await this.adminService.getMissingRequests();
            res.json({ status: 'success', data: requests });
        } catch (error: any) {
            res.status(500).json({ status: 'error', message: error.message });
        }
    }

    async getOwners(req: Request, res: Response) {
        try {
            const owners = await this.adminService.getOwners();
            res.json({ status: 'success', data: owners });
        } catch (error: any) {
            res.status(500).json({ status: 'error', message: error.message });
        }
    }

    async approveOwner(req: Request, res: Response) {
        try {
            const ownerId = req.params.ownerId as string;
            const { isApproved } = req.body;
            const owner = await this.adminService.approveOwner(ownerId, isApproved);
            res.json({ status: 'success', data: owner });
        } catch (error: any) {
            res.status(500).json({ status: 'error', message: error.message });
        }
    }

    async updateOwnerConfig(req: Request, res: Response) {
        try {
            const ownerId = req.params.ownerId as string;
            const config = req.body;
            const updatedConfig = await this.adminService.updateOwnerConfig(ownerId, config);
            res.json({ status: 'success', data: updatedConfig });
        } catch (error: any) {
            res.status(500).json({ status: 'error', message: error.message });
        }
    }

    async getSystemConfig(req: Request, res: Response) {
        try {
            const config = await this.adminService.getSystemConfig();
            res.json({ status: 'success', data: config });
        } catch (error: any) {
            res.status(500).json({ status: 'error', message: error.message });
        }
    }

    async updateSystemConfig(req: Request, res: Response) {
        try {
            const { aiSystemPrompt, geminiApiKey, chatRetentionDays } = req.body;
            const config = await this.adminService.updateSystemConfig({ aiSystemPrompt, geminiApiKey, chatRetentionDays });
            res.json({ status: 'success', data: config });
        } catch (error: any) {
            res.status(500).json({ status: 'error', message: error.message });
        }
    }
}
