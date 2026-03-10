function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }
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

            const contributorId = _optionalChain([req, 'access', _ => _.user, 'optionalAccess', _2 => _2.role]) === (Role).CONTRIBUTOR ? _optionalChain([req, 'access', _3 => _3.user, 'optionalAccess', _4 => _4.id]) : undefined;
            const result = await ownerService.getMissingRequests(ownerId, contributorId);
            return res.json(result);
        } catch (error) {
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

            const contributorId = _optionalChain([req, 'access', _5 => _5.user, 'optionalAccess', _6 => _6.role]) === (Role).CONTRIBUTOR ? _optionalChain([req, 'access', _7 => _7.user, 'optionalAccess', _8 => _8.id]) : undefined;
            const result = await ownerService.getRatings(ownerId, contributorId);
            return res.json(result);
        } catch (error) {
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

            const contributorId = _optionalChain([req, 'access', _9 => _9.user, 'optionalAccess', _10 => _10.role]) === (Role).CONTRIBUTOR ? _optionalChain([req, 'access', _11 => _11.user, 'optionalAccess', _12 => _12.id]) : undefined;
            const result = await ownerService.getChatHistory(ownerId, contributorId);
            return res.json(result);
        } catch (error) {
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
        } catch (error) {
            if (error.message === 'Owner not found') {
                return res.status(404).json({
                    status: 'error',
                    message: 'Owner not found'
                });
            }
            console.error('Get Public Owner Controller Error:', error);
            return res.status(500).json({
                status: 'error',
                message: error instanceof Error ? error.message : 'Internal Server Error'
            });
        }
    }

    /**
     * GET /api/public/owners/list
     * Get list of public approved owners
     */
    async getPublicOwners(req, res) {
        try {
            const limit = req.query.limit ? parseInt(req.query.limit) : 5;
            const result = await ownerService.getPublicOwners(limit);
            return res.json(result);
        } catch (error) {
            console.error('Get Public Owners Controller Error:', error);
            return res.status(500).json({
                status: 'error',
                message: 'Failed to fetch owners list'
            });
        }
    }
    /**
     * GET /api/owner/live-support
     */
    async getLiveSupportSessions(req, res) {
        try {
            const resolvedOwnerId = _optionalChain([req, 'access', _13 => _13.user, 'optionalAccess', _14 => _14.ownerId]) || _optionalChain([req, 'access', _15 => _15.user, 'optionalAccess', _16 => _16.memberOfId]);
            if (!resolvedOwnerId) return res.status(403).json({ status: 'error', message: 'Forbidden' });
            const contributorId = _optionalChain([req, 'access', _17 => _17.user, 'optionalAccess', _18 => _18.role]) === (Role).CONTRIBUTOR ? _optionalChain([req, 'access', _19 => _19.user, 'optionalAccess', _20 => _20.id]) : undefined;
            const result = await ownerService.getLiveSupportSessions(resolvedOwnerId, contributorId);
            return res.json(result);
        } catch (error) {
            console.error('Get Live Sessions Error:', error);
            return res.status(500).json({ status: 'error', message: 'Failed to fetch sessions' });
        }
    }

    /**
     * POST /api/owner/live-support/respond
     */
    async respondToChat(req, res) {
        try {
            const resolvedOwnerId = _optionalChain([req, 'access', _21 => _21.user, 'optionalAccess', _22 => _22.ownerId]) || _optionalChain([req, 'access', _23 => _23.user, 'optionalAccess', _24 => _24.memberOfId]);
            if (!resolvedOwnerId) return res.status(403).json({ status: 'error', message: 'Forbidden' });
            const { userId, message } = req.body;
            if (!userId || !message) return res.status(400).json({ status: 'error', message: 'Missing fields' });

            // Pass the current user's ID as the staffId
            const staffId = _optionalChain([req, 'access', _25 => _25.user, 'optionalAccess', _26 => _26.id]);
            if (!staffId) return res.status(401).json({ status: 'error', message: 'Unauthorized' });

            const result = await ownerService.respondToChat(resolvedOwnerId, userId, message, staffId);
            return res.json(result);
        } catch (error) {
            console.error('Respond to Chat Error:', error);
            return res.status(500).json({ status: 'error', message: 'Failed to send response' });
        }
    }

    /**
     * GET /api/owner/live-support/:userId
     */
    async getLiveChatHistory(req, res) {
        try {
            const resolvedOwnerId = _optionalChain([req, 'access', _27 => _27.user, 'optionalAccess', _28 => _28.ownerId]) || _optionalChain([req, 'access', _29 => _29.user, 'optionalAccess', _30 => _30.memberOfId]);
            if (!resolvedOwnerId) return res.status(403).json({ status: 'error', message: 'Forbidden' });
            const userId = req.params.userId;
            const since = req.query.since;

            if (typeof userId !== 'string') {
                return res.status(400).json({ status: 'error', message: 'User ID is required' });
            }

            const result = await ownerService.getLiveChatHistory(
                resolvedOwnerId,
                userId,
                typeof since === 'string' ? since : undefined
            );
            return res.json(result);
        } catch (error) {
            console.error('Get Live Chat History Error:', error);
            return res.status(500).json({ status: 'error', message: 'Failed to fetch history' });
        }
    }

    /**
     * PATCH /api/owner/settings
     */
    async updateStoreSettings(req, res) {
        try {
            if (!_optionalChain([req, 'access', _31 => _31.user, 'optionalAccess', _32 => _32.ownerId])) return res.status(403).json({ status: 'error', message: 'Forbidden' });

            const { name, domain, latitude, longitude } = req.body;
            const updatePayload = {};
            if (name !== undefined) updatePayload.name = name;
            if (domain !== undefined) updatePayload.domain = domain;
            if (latitude !== undefined) updatePayload.latitude = parseFloat(latitude);
            if (longitude !== undefined) updatePayload.longitude = parseFloat(longitude);

            const result = await ownerService.updateStoreSettings(req.user.ownerId, updatePayload);

            return res.json(result);
        } catch (error) {
            return res.status(500).json({ status: 'error', message: 'Failed to update store settings' });
        }
    }

    async getStoreMembers(req, res) {
        try {
            const ownerId = _optionalChain([req, 'access', _33 => _33.user, 'optionalAccess', _34 => _34.ownerId]);
            if (!ownerId) return res.status(403).json({ status: 'error', message: 'Forbidden' });

            const result = await ownerService.getStoreMembers(ownerId);
            return res.json(result);
        } catch (error) {
            console.error('Get Members Error:', error);
            return res.status(500).json({ status: 'error', message: 'Failed to fetch members' });
        }
    }

    async getStaffActivity(req, res) {
        try {
            const ownerId = _optionalChain([req, 'access', _35 => _35.user, 'optionalAccess', _36 => _36.ownerId]);
            if (!ownerId) return res.status(403).json({ status: 'error', message: 'Forbidden' });

            const staffId = req.params.staffId;
            if (!staffId || typeof staffId !== 'string') {
                return res.status(400).json({ status: 'error', message: 'Staff ID is required' });
            }

            const result = await ownerService.getStaffActivity(ownerId, staffId);
            return res.json(result);
        } catch (error) {
            console.error('Get Staff Activity Error:', error);
            return res.status(500).json({ status: 'error', message: 'Failed to fetch staff activity' });
        }
    }

    async updateMemberRole(req, res) {
        try {
            const ownerId = _optionalChain([req, 'access', _37 => _37.user, 'optionalAccess', _38 => _38.ownerId]);
            if (!ownerId) return res.status(403).json({ status: 'error', message: 'Forbidden' });

            const memberId = req.params.memberId;
            const { role } = req.body;

            if (!memberId || !role || typeof memberId !== 'string') {
                return res.status(400).json({ status: 'error', message: 'Member ID and role are required' });
            }

            const result = await ownerService.updateMemberRole(ownerId, memberId, role);
            return res.json(result);
        } catch (error) {
            console.error('Update Member Role Error:', error);
            return res.status(500).json({ status: 'error', message: error instanceof Error ? error.message : 'Failed to update member role' });
        }
    }

    async updateMember(req, res) {
        try {
            const ownerId = _optionalChain([req, 'access', _39 => _39.user, 'optionalAccess', _40 => _40.ownerId]);
            if (!ownerId) return res.status(403).json({ status: 'error', message: 'Forbidden' });

            const memberId = req.params.memberId;
            const { name, phone, position, role, staffRoleId, disabledMenus } = req.body;

            if (!memberId || typeof memberId !== 'string') {
                return res.status(400).json({ status: 'error', message: 'Member ID is required' });
            }

            const result = await ownerService.updateMember(ownerId, memberId, { name, phone, position, role, staffRoleId, disabledMenus });
            return res.json(result);
        } catch (error) {
            console.error('Update Member Error:', error);
            return res.status(500).json({ status: 'error', message: error instanceof Error ? error.message : 'Failed to update member' });
        }
    }

    async deleteMember(req, res) {
        try {
            const ownerId = _optionalChain([req, 'access', _41 => _41.user, 'optionalAccess', _42 => _42.ownerId]);
            if (!ownerId) return res.status(403).json({ status: 'error', message: 'Forbidden' });

            const { memberId } = req.params;
            if (!memberId) return res.status(400).json({ status: 'error', message: 'Member ID is required' });

            const result = await ownerService.deleteMember(ownerId, memberId);
            return res.json(result);
        } catch (error) {
            console.error('Delete Member Error:', error);
            return res.status(500).json({ status: 'error', message: error instanceof Error ? error.message : 'Failed to delete member' });
        }
    }

    async deleteMembers(req, res) {
        try {
            const ownerId = _optionalChain([req, 'access', _43 => _43.user, 'optionalAccess', _44 => _44.ownerId]);
            if (!ownerId) return res.status(403).json({ status: 'error', message: 'Forbidden' });

            const { memberIds } = req.body;
            if (!memberIds || !Array.isArray(memberIds)) {
                return res.status(400).json({ status: 'error', message: 'Member IDs array is required' });
            }

            const result = await ownerService.deleteMembers(ownerId, memberIds);
            return res.json(result);
        } catch (error) {
            console.error('Bulk Delete Members Error:', error);
            return res.status(500).json({ status: 'error', message: error instanceof Error ? error.message : 'Failed to delete members' });
        }
    }

    /**
     * POST /api/owner/staff
     */
    async createStaff(req, res) {
        try {
            const ownerId = _optionalChain([req, 'access', _45 => _45.user, 'optionalAccess', _46 => _46.ownerId]);
            if (!ownerId) return res.status(403).json({ status: 'error', message: 'Forbidden' });

            const { email, password, name, phone, position, staffRoleId } = req.body;
            if (!email || !password || !name) {
                return res.status(400).json({ status: 'error', message: 'Email, password, and name are required' });
            }

            const result = await ownerService.createStaffAccount(ownerId, { email, password, name, phone, position, staffRoleId });
            return res.json(result);
        } catch (error) {
            return res.status(500).json({ status: 'error', message: error instanceof Error ? error.message : 'Failed to create staff account' });
        }
    }

    async getStaffRoles(req, res) {
        try {
            const ownerId = _optionalChain([req, 'access', _47 => _47.user, 'optionalAccess', _48 => _48.ownerId]);
            if (!ownerId) return res.status(403).json({ status: 'error', message: 'Forbidden' });
            const result = await ownerService.getStaffRoles(ownerId);
            return res.json(result);
        } catch (error) {
            return res.status(500).json({ status: 'error', message: 'Failed to fetch roles' });
        }
    }

    async createStaffRole(req, res) {
        try {
            const ownerId = _optionalChain([req, 'access', _49 => _49.user, 'optionalAccess', _50 => _50.ownerId]);
            if (!ownerId) return res.status(403).json({ status: 'error', message: 'Forbidden' });
            const { name, permissions } = req.body;
            if (!name) return res.status(400).json({ status: 'error', message: 'Role name is required' });
            const result = await ownerService.createStaffRole(ownerId, name, permissions);
            return res.json(result);
        } catch (error) {
            return res.status(500).json({ status: 'error', message: error instanceof Error ? error.message : 'Failed to create role' });
        }
    }

    async updateStaffRole(req, res) {
        try {
            const ownerId = _optionalChain([req, 'access', _51 => _51.user, 'optionalAccess', _52 => _52.ownerId]);
            if (!ownerId) return res.status(403).json({ status: 'error', message: 'Forbidden' });
            const { roleId } = req.params;
            const { name, permissions } = req.body;
            if (!roleId) return res.status(400).json({ status: 'error', message: 'Role ID is required' });
            const result = await ownerService.updateStaffRole(ownerId, roleId, { name, permissions });
            return res.json(result);
        } catch (error) {
            return res.status(500).json({ status: 'error', message: error instanceof Error ? error.message : 'Failed to update role' });
        }
    }

    async deleteStaffRole(req, res) {
        try {
            const ownerId = _optionalChain([req, 'access', _53 => _53.user, 'optionalAccess', _54 => _54.ownerId]);
            if (!ownerId) return res.status(403).json({ status: 'error', message: 'Forbidden' });
            const { roleId } = req.params;
            if (!roleId) return res.status(400).json({ status: 'error', message: 'Role ID is required' });
            const result = await ownerService.deleteStaffRole(ownerId, roleId);

            return res.json(result);
        } catch (error) {
            return res.status(500).json({ status: 'error', message: 'Failed to delete role' });
        }
    }

    /**
     * GET /api/owner/config
     */
    async getOwnerConfig(req, res) {
        try {
            const ownerId = _optionalChain([req, 'access', _55 => _55.user, 'optionalAccess', _56 => _56.ownerId]);
            if (!ownerId) return res.status(403).json({ status: 'error', message: 'Forbidden' });

            const result = await ownerService.getOwnerConfig(ownerId);
            return res.json(result);
        } catch (error) {
            return res.status(500).json({ status: 'error', message: 'Failed to fetch owner config' });
        }
    }

    /**
     * PATCH /api/owner/config
     */
    async updateOwnerConfig(req, res) {
        try {
            const ownerId = _optionalChain([req, 'access', _57 => _57.user, 'optionalAccess', _58 => _58.ownerId]);
            if (!ownerId) return res.status(403).json({ status: 'error', message: 'Forbidden' });

            const result = await ownerService.updateOwnerConfig(ownerId, req.body);
            return res.json(result);
        } catch (error) {
            return res.status(500).json({ status: 'error', message: 'Failed to update owner config' });
        }
    }
}

