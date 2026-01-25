import { Router, type Router as ExpressRouter } from 'express';
import { OwnerController } from './owner.controller.js';
import { authenticate } from '../../common/middleware/auth.middleware.js';
import { requireOwner, requireOwnData } from '../../common/middleware/rbac.middleware.js';

const router: ExpressRouter = Router();
const ownerController = new OwnerController();

// All routes require Owner role and ownership validation
router.get('/missing-request/:ownerId', authenticate, requireOwner(), requireOwnData(), (req, res) =>
    ownerController.getMissingRequests(req, res)
);

router.get('/ratings/:ownerId', authenticate, requireOwner(), requireOwnData(), (req, res) =>
    ownerController.getRatings(req, res)
);

router.get('/chat-history/:ownerId', authenticate, requireOwner(), requireOwnData(), (req, res) =>
    ownerController.getChatHistory(req, res)
);

export default router;
