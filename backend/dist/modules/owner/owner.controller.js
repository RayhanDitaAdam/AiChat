import { OwnerService } from './owner.service.js';
import { Role } from '../../common/types/auth.types.js';
const ownerService = new OwnerService();
export class OwnerController {
    /**
     * GET /api/missing-request/:ownerId
     * Get missing product requests for owner (Owner role only)
     */
    async getMissingRequests(req, res) {
        try {
            const ownerId = req.params.ownerId;
            if (!ownerId) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Owner ID is required'
                });
            }
            const contributorId = req.user?.role === Role.CONTRIBUTOR ? req.user?.id : undefined;
            const result = await ownerService.getMissingRequests(ownerId, contributorId);
            return res.json(result);
        }
        catch (error) {
            console.error('Get Missing Requests Controller Error:', error);
            return res.status(500).json({
                status: 'error',
                message: error instanceof Error ? error.message : 'Failed to fetch missing requests'
            });
        }
    }
    /**
     * GET /api/ratings/:ownerId
     * Get ratings for owner (Owner role only)
     */
    async getRatings(req, res) {
        try {
            const ownerId = req.params.ownerId;
            if (!ownerId) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Owner ID is required'
                });
            }
            const contributorId = req.user?.role === Role.CONTRIBUTOR ? req.user?.id : undefined;
            const result = await ownerService.getRatings(ownerId, contributorId);
            return res.json(result);
        }
        catch (error) {
            console.error('Get Ratings Controller Error:', error);
            return res.status(500).json({
                status: 'error',
                message: error instanceof Error ? error.message : 'Failed to fetch ratings'
            });
        }
    }
    /**
     * GET /api/chat-history/:ownerId
     * Get chat history for owner (Owner role only)
     */
    async getChatHistory(req, res) {
        try {
            const ownerId = req.params.ownerId;
            if (!ownerId) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Owner ID is required'
                });
            }
            const contributorId = req.user?.role === Role.CONTRIBUTOR ? req.user?.id : undefined;
            const result = await ownerService.getChatHistory(ownerId, contributorId);
            return res.json(result);
        }
        catch (error) {
            console.error('Get Chat History Controller Error:', error);
            return res.status(500).json({
                status: 'error',
                message: error instanceof Error ? error.message : 'Failed to fetch chat history'
            });
        }
    }
    /**
     * GET /api/public/owners/:domain
     * Get owner details by domain (Public)
     */
    async getPublicOwnerByDomain(req, res) {
        try {
            const domain = req.params.domain;
            if (!domain) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Domain is required'
                });
            }
            const result = await ownerService.getOwnerByDomain(domain);
            return res.json(result);
        }
        catch (error) {
            console.error('Get Public Owner Controller Error:', error);
            return res.status(404).json({
                status: 'error',
                message: error instanceof Error ? error.message : 'Owner not found'
            });
        }
    }
    /**
     * GET /api/owner/live-support
     */
    async getLiveSupportSessions(req, res) {
        try {
            const resolvedOwnerId = req.user?.ownerId || req.user?.memberOfId;
            if (!resolvedOwnerId)
                return res.status(403).json({ status: 'error', message: 'Forbidden' });
            const contributorId = req.user?.role === Role.CONTRIBUTOR ? req.user?.id : undefined;
            const result = await ownerService.getLiveSupportSessions(resolvedOwnerId, contributorId);
            return res.json(result);
        }
        catch (error) {
            console.error('Get Live Sessions Error:', error);
            return res.status(500).json({ status: 'error', message: 'Failed to fetch sessions' });
        }
    }
    /**
     * POST /api/owner/live-support/respond
     */
    async respondToChat(req, res) {
        try {
            const resolvedOwnerId = req.user?.ownerId || req.user?.memberOfId;
            if (!resolvedOwnerId)
                return res.status(403).json({ status: 'error', message: 'Forbidden' });
            const { userId, message } = req.body;
            if (!userId || !message)
                return res.status(400).json({ status: 'error', message: 'Missing fields' });
            // Pass the current user's ID as the staffId
            const staffId = req.user?.id;
            if (!staffId)
                return res.status(401).json({ status: 'error', message: 'Unauthorized' });
            const result = await ownerService.respondToChat(resolvedOwnerId, userId, message, staffId);
            return res.json(result);
        }
        catch (error) {
            console.error('Respond to Chat Error:', error);
            return res.status(500).json({ status: 'error', message: 'Failed to send response' });
        }
    }
    /**
     * GET /api/owner/live-support/:userId
     */
    async getLiveChatHistory(req, res) {
        try {
            const resolvedOwnerId = req.user?.ownerId || req.user?.memberOfId;
            if (!resolvedOwnerId)
                return res.status(403).json({ status: 'error', message: 'Forbidden' });
            const userId = req.params.userId;
            const since = req.query.since;
            if (typeof userId !== 'string') {
                return res.status(400).json({ status: 'error', message: 'User ID is required' });
            }
            const result = await ownerService.getLiveChatHistory(resolvedOwnerId, userId, typeof since === 'string' ? since : undefined);
            return res.json(result);
        }
        catch (error) {
            console.error('Get Live Chat History Error:', error);
            return res.status(500).json({ status: 'error', message: 'Failed to fetch history' });
        }
    }
    /**
     * PATCH /api/owner/settings
     */
    async updateStoreSettings(req, res) {
        try {
            if (!req.user?.ownerId)
                return res.status(403).json({ status: 'error', message: 'Forbidden' });
            const { name, domain, latitude, longitude } = req.body;
            const updatePayload = {};
            if (name !== undefined)
                updatePayload.name = name;
            if (domain !== undefined)
                updatePayload.domain = domain;
            if (latitude !== undefined)
                updatePayload.latitude = parseFloat(latitude);
            if (longitude !== undefined)
                updatePayload.longitude = parseFloat(longitude);
            const result = await ownerService.updateStoreSettings(req.user.ownerId, updatePayload);
            return res.json(result);
        }
        catch (error) {
            return res.status(500).json({ status: 'error', message: 'Failed to update store settings' });
        }
    }
    async getStoreMembers(req, res) {
        try {
            const ownerId = req.user?.ownerId;
            if (!ownerId)
                return res.status(403).json({ status: 'error', message: 'Forbidden' });
            const result = await ownerService.getStoreMembers(ownerId);
            return res.json(result);
        }
        catch (error) {
            console.error('Get Members Error:', error);
            return res.status(500).json({ status: 'error', message: 'Failed to fetch members' });
        }
    }
    async getStaffActivity(req, res) {
        try {
            const ownerId = req.user?.ownerId;
            if (!ownerId)
                return res.status(403).json({ status: 'error', message: 'Forbidden' });
            const staffId = req.params.staffId;
            if (!staffId || typeof staffId !== 'string') {
                return res.status(400).json({ status: 'error', message: 'Staff ID is required' });
            }
            const result = await ownerService.getStaffActivity(ownerId, staffId);
            return res.json(result);
        }
        catch (error) {
            console.error('Get Staff Activity Error:', error);
            return res.status(500).json({ status: 'error', message: 'Failed to fetch staff activity' });
        }
    }
    async updateMemberRole(req, res) {
        try {
            const ownerId = req.user?.ownerId;
            if (!ownerId)
                return res.status(403).json({ status: 'error', message: 'Forbidden' });
            const memberId = req.params.memberId;
            const { role } = req.body;
            if (!memberId || !role || typeof memberId !== 'string') {
                return res.status(400).json({ status: 'error', message: 'Member ID and role are required' });
            }
            const result = await ownerService.updateMemberRole(ownerId, memberId, role);
            return res.json(result);
        }
        catch (error) {
            console.error('Update Member Role Error:', error);
            return res.status(500).json({ status: 'error', message: error instanceof Error ? error.message : 'Failed to update member role' });
        }
    }
    async updateMember(req, res) {
        try {
            const ownerId = req.user?.ownerId;
            if (!ownerId)
                return res.status(403).json({ status: 'error', message: 'Forbidden' });
            const memberId = req.params.memberId;
            const { name, phone, position, role, staffRoleId, disabledMenus } = req.body;
            if (!memberId || typeof memberId !== 'string') {
                return res.status(400).json({ status: 'error', message: 'Member ID is required' });
            }
            const result = await ownerService.updateMember(ownerId, memberId, { name, phone, position, role, staffRoleId, disabledMenus });
            return res.json(result);
        }
        catch (error) {
            console.error('Update Member Error:', error);
            return res.status(500).json({ status: 'error', message: error instanceof Error ? error.message : 'Failed to update member' });
        }
    }
    async deleteMember(req, res) {
        try {
            const ownerId = req.user?.ownerId;
            if (!ownerId)
                return res.status(403).json({ status: 'error', message: 'Forbidden' });
            const { memberId } = req.params;
            if (!memberId)
                return res.status(400).json({ status: 'error', message: 'Member ID is required' });
            const result = await ownerService.deleteMember(ownerId, memberId);
            return res.json(result);
        }
        catch (error) {
            console.error('Delete Member Error:', error);
            return res.status(500).json({ status: 'error', message: error instanceof Error ? error.message : 'Failed to delete member' });
        }
    }
    async deleteMembers(req, res) {
        try {
            const ownerId = req.user?.ownerId;
            if (!ownerId)
                return res.status(403).json({ status: 'error', message: 'Forbidden' });
            const { memberIds } = req.body;
            if (!memberIds || !Array.isArray(memberIds)) {
                return res.status(400).json({ status: 'error', message: 'Member IDs array is required' });
            }
            const result = await ownerService.deleteMembers(ownerId, memberIds);
            return res.json(result);
        }
        catch (error) {
            console.error('Bulk Delete Members Error:', error);
            return res.status(500).json({ status: 'error', message: error instanceof Error ? error.message : 'Failed to delete members' });
        }
    }
    /**
     * POST /api/owner/staff
     */
    async createStaff(req, res) {
        try {
            const ownerId = req.user?.ownerId;
            if (!ownerId)
                return res.status(403).json({ status: 'error', message: 'Forbidden' });
            const { email, password, name, phone, position, staffRoleId } = req.body;
            if (!email || !password || !name) {
                return res.status(400).json({ status: 'error', message: 'Email, password, and name are required' });
            }
            const result = await ownerService.createStaffAccount(ownerId, { email, password, name, phone, position, staffRoleId });
            return res.json(result);
        }
        catch (error) {
            return res.status(500).json({ status: 'error', message: error instanceof Error ? error.message : 'Failed to create staff account' });
        }
    }
    async getStaffRoles(req, res) {
        try {
            const ownerId = req.user?.ownerId;
            if (!ownerId)
                return res.status(403).json({ status: 'error', message: 'Forbidden' });
            const result = await ownerService.getStaffRoles(ownerId);
            return res.json(result);
        }
        catch (error) {
            return res.status(500).json({ status: 'error', message: 'Failed to fetch roles' });
        }
    }
    async createStaffRole(req, res) {
        try {
            const ownerId = req.user?.ownerId;
            if (!ownerId)
                return res.status(403).json({ status: 'error', message: 'Forbidden' });
            const { name, permissions } = req.body;
            if (!name)
                return res.status(400).json({ status: 'error', message: 'Role name is required' });
            const result = await ownerService.createStaffRole(ownerId, name, permissions);
            return res.json(result);
        }
        catch (error) {
            return res.status(500).json({ status: 'error', message: error instanceof Error ? error.message : 'Failed to create role' });
        }
    }
    async updateStaffRole(req, res) {
        try {
            const ownerId = req.user?.ownerId;
            if (!ownerId)
                return res.status(403).json({ status: 'error', message: 'Forbidden' });
            const { roleId } = req.params;
            const { name, permissions } = req.body;
            if (!roleId)
                return res.status(400).json({ status: 'error', message: 'Role ID is required' });
            const result = await ownerService.updateStaffRole(ownerId, roleId, { name, permissions });
            return res.json(result);
        }
        catch (error) {
            return res.status(500).json({ status: 'error', message: error instanceof Error ? error.message : 'Failed to update role' });
        }
    }
    async deleteStaffRole(req, res) {
        try {
            const ownerId = req.user?.ownerId;
            if (!ownerId)
                return res.status(403).json({ status: 'error', message: 'Forbidden' });
            const { roleId } = req.params;
            if (!roleId)
                return res.status(400).json({ status: 'error', message: 'Role ID is required' });
            const result = await ownerService.deleteStaffRole(ownerId, roleId);
            return res.json(result);
        }
        catch (error) {
            return res.status(500).json({ status: 'error', message: 'Failed to delete role' });
        }
    }
    /**
     * GET /api/owner/config
     */
    async getOwnerConfig(req, res) {
        try {
            const ownerId = req.user?.ownerId;
            if (!ownerId)
                return res.status(403).json({ status: 'error', message: 'Forbidden' });
            const result = await ownerService.getOwnerConfig(ownerId);
            return res.json(result);
        }
        catch (error) {
            return res.status(500).json({ status: 'error', message: 'Failed to fetch owner config' });
        }
    }
    /**
     * PATCH /api/owner/config
     */
    async updateOwnerConfig(req, res) {
        try {
            const ownerId = req.user?.ownerId;
            if (!ownerId)
                return res.status(403).json({ status: 'error', message: 'Forbidden' });
            const result = await ownerService.updateOwnerConfig(ownerId, req.body);
            return res.json(result);
        }
        catch (error) {
            return res.status(500).json({ status: 'error', message: 'Failed to update owner config' });
        }
    }
}
//# sourceMappingURL=owner.controller.js.map