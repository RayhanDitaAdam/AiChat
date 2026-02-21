import { AdminService } from './admin.service.js';
export class AdminController {
    adminService = new AdminService();
    async getStats(req, res) {
        try {
            const stats = await this.adminService.getStats();
            res.json({ status: 'success', data: stats });
        }
        catch (error) {
            res.status(500).json({ status: 'error', message: error.message });
        }
    }
    async getMissingRequests(req, res) {
        try {
            const requests = await this.adminService.getMissingRequests();
            res.json({ status: 'success', data: requests });
        }
        catch (error) {
            res.status(500).json({ status: 'error', message: error.message });
        }
    }
    async getOwners(req, res) {
        try {
            const owners = await this.adminService.getOwners();
            res.json({ status: 'success', data: owners });
        }
        catch (error) {
            res.status(500).json({ status: 'error', message: error.message });
        }
    }
    async approveOwner(req, res) {
        try {
            const ownerId = req.params.ownerId;
            const { isApproved } = req.body;
            const owner = await this.adminService.approveOwner(ownerId, isApproved);
            res.json({ status: 'success', data: owner });
        }
        catch (error) {
            res.status(500).json({ status: 'error', message: error.message });
        }
    }
    async updateOwnerConfig(req, res) {
        try {
            const ownerId = req.params.ownerId;
            const config = req.body;
            const updatedConfig = await this.adminService.updateOwnerConfig(ownerId, config);
            res.json({ status: 'success', data: updatedConfig });
        }
        catch (error) {
            res.status(500).json({ status: 'error', message: error.message });
        }
    }
    async updateOwnerCategory(req, res) {
        try {
            const ownerId = req.params.ownerId;
            const { businessCategory } = req.body;
            const owner = await this.adminService.updateOwnerCategory(ownerId, businessCategory);
            res.json({ status: 'success', data: owner });
        }
        catch (error) {
            res.status(500).json({ status: 'error', message: error.message });
        }
    }
    async getSystemConfig(req, res) {
        try {
            const config = await this.adminService.getSystemConfig();
            res.json({ status: 'success', data: config });
        }
        catch (error) {
            res.status(500).json({ status: 'error', message: error.message });
        }
    }
    async updateSystemConfig(req, res) {
        try {
            const { aiSystemPrompt, geminiApiKey, chatRetentionDays } = req.body;
            const config = await this.adminService.updateSystemConfig({ aiSystemPrompt, geminiApiKey, chatRetentionDays });
            res.json({ status: 'success', data: config });
        }
        catch (error) {
            res.status(500).json({ status: 'error', message: error.message });
        }
    }
    async getUsers(req, res) {
        try {
            const users = await this.adminService.getUsers();
            res.json({ status: 'success', data: users });
        }
        catch (error) {
            res.status(500).json({ status: 'error', message: error.message });
        }
    }
    async updateUserMenus(req, res) {
        try {
            const userId = req.params.userId;
            const { disabledMenus } = req.body;
            const user = await this.adminService.updateUserMenus(userId, disabledMenus);
            res.json({ status: 'success', data: user });
        }
        catch (error) {
            res.status(500).json({ status: 'error', message: error.message });
        }
    }
    async toggleUserBlock(req, res) {
        try {
            const userId = req.params.userId;
            const { isBlocked } = req.body;
            const user = await this.adminService.toggleUserBlock(userId, isBlocked);
            res.json({ status: 'success', data: user });
        }
        catch (error) {
            res.status(500).json({ status: 'error', message: error.message });
        }
    }
}
//# sourceMappingURL=admin.controller.js.map