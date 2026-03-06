import { Router, } from 'express';
import { OwnerController } from './owner.controller.js';
import { authenticate } from '../../common/middleware/auth.middleware.js';
import { requireOwner, requireOwnData, requireApproved, requireStaffOrOwner } from '../../common/middleware/rbac.middleware.js';

const router = Router();
const ownerController = new OwnerController();

// PUBLIC routes (Unauthenticated)
router.get('/public/owners/:domain', (req, res) =>
    ownerController.getPublicOwnerByDomain(req, res)
);

// All routes below require Authentication
router.get('/missing-request/:ownerId', authenticate, requireStaffOrOwner(), requireApproved(), requireOwnData(), (req, res) =>
    ownerController.getMissingRequests(req, res)
);

router.get('/ratings/:ownerId', authenticate, requireStaffOrOwner(), requireApproved(), requireOwnData(), (req, res) =>
    ownerController.getRatings(req, res)
);

router.get('/chat-history/:ownerId', authenticate, requireStaffOrOwner(), requireApproved(), requireOwnData(), (req, res) =>
    ownerController.getChatHistory(req, res)
);

// Live Support Routes - Allow Staff or Owner
router.get('/owner/live-support', authenticate, requireStaffOrOwner(), requireApproved(), (req, res) =>
    ownerController.getLiveSupportSessions(req, res)
);

router.post('/owner/live-support/respond', authenticate, requireStaffOrOwner(), requireApproved(), (req, res) =>
    ownerController.respondToChat(req, res)
);

router.get('/owner/live-support/:userId', authenticate, requireStaffOrOwner(), requireApproved(), (req, res) =>
    ownerController.getLiveChatHistory(req, res)
);

router.patch('/owner/settings', authenticate, requireOwner(), requireApproved(), (req, res) =>
    ownerController.updateStoreSettings(req, res)
);

// Advanced AI & Store Config
router.get('/owner/config', authenticate, requireOwner(), requireApproved(), (req, res) =>
    ownerController.getOwnerConfig(req, res)
);

router.patch('/owner/config', authenticate, requireOwner(), requireApproved(), (req, res) =>
    ownerController.updateOwnerConfig(req, res)
);

// Member/Staff Management
router.get('/owner/members', authenticate, requireStaffOrOwner(), requireApproved(), (req, res) =>
    ownerController.getStoreMembers(req, res)
);
router.patch('/owner/members/:memberId/role', authenticate, requireOwner(), requireApproved(), (req, res) =>
    ownerController.updateMemberRole(req, res)
);
router.patch('/owner/members/:memberId', authenticate, requireOwner(), requireApproved(), (req, res) =>
    ownerController.updateMember(req, res)
);
router.delete('/owner/members/:memberId', authenticate, requireOwner(), requireApproved(), (req, res) =>
    ownerController.deleteMember(req, res)
);
router.post('/owner/members/bulk-delete', authenticate, requireOwner(), requireApproved(), (req, res) =>
    ownerController.deleteMembers(req, res)
);
router.post('/owner/staff', authenticate, requireOwner(), requireApproved(), (req, res) =>
    ownerController.createStaff(req, res)
);

router.get('/owner/staff/:staffId/activity', authenticate, requireOwner(), requireApproved(), (req, res) =>
    ownerController.getStaffActivity(req, res)
);

// Staff Role Management
router.get('/owner/roles', authenticate, requireStaffOrOwner(), requireApproved(), (req, res) =>
    ownerController.getStaffRoles(req, res)
);

router.post('/owner/roles', authenticate, requireOwner(), requireApproved(), (req, res) =>
    ownerController.createStaffRole(req, res)
);

router.patch('/owner/roles/:roleId', authenticate, requireOwner(), requireApproved(), (req, res) =>
    ownerController.updateStaffRole(req, res)
);

router.delete('/owner/roles/:roleId', authenticate, requireOwner(), requireApproved(), (req, res) =>
    ownerController.deleteStaffRole(req, res)
);


export default router;
