import { Router, type Router as ExpressRouter } from 'express';
import { OwnerController } from './owner.controller.js';
import { authenticate } from '../../common/middleware/auth.middleware.js';
import { requireOwner, requireOwnData, requireApproved } from '../../common/middleware/rbac.middleware.js';

const router: ExpressRouter = Router();
const ownerController = new OwnerController();

// PUBLIC routes (Unauthenticated)
router.get('/public/owners/:domain', (req, res) =>
    ownerController.getPublicOwnerByDomain(req, res)
);

// All routes below require Authentication
router.get('/missing-request/:ownerId', authenticate, requireOwner(), requireApproved(), requireOwnData(), (req, res) =>
    ownerController.getMissingRequests(req, res)
);

router.get('/ratings/:ownerId', authenticate, requireOwner(), requireApproved(), requireOwnData(), (req, res) =>
    ownerController.getRatings(req, res)
);

router.get('/chat-history/:ownerId', authenticate, requireOwner(), requireApproved(), requireOwnData(), (req, res) =>
    ownerController.getChatHistory(req, res)
);

// Live Support Routes
router.get('/owner/live-support', authenticate, requireOwner(), requireApproved(), (req, res) =>
    ownerController.getLiveSupportSessions(req, res)
);

router.post('/owner/live-support/respond', authenticate, requireOwner(), requireApproved(), (req, res) =>
    ownerController.respondToChat(req, res)
);

router.get('/owner/live-support/:userId', authenticate, requireOwner(), requireApproved(), (req, res) =>
    ownerController.getLiveChatHistory(req, res)
);

export default router;
