import { Router, type Router as ExpressRouter } from 'express';
import { ChatController } from './chat.controller.js';
import { ChatSchema } from './chat.schema.js';
import { validate } from '../../common/middleware/zod.middleware.js';
import { authenticate } from '../../common/middleware/auth.middleware.js';
import { requireRole } from '../../common/middleware/rbac.middleware.js';
import { Role } from '../../common/types/auth.types.js';

const router: ExpressRouter = Router();
const chatController = new ChatController();

router.post('/', authenticate, requireRole(Role.USER, Role.OWNER), validate(ChatSchema), (req, res) =>
  chatController.handleChat(req, res)
);

router.get('/history', authenticate, (req, res) =>
  chatController.getHistory(req, res)
);

router.post('/sessions', authenticate, (req, res) =>
  chatController.createSession(req, res)
);

router.get('/sessions/:sessionId/messages', authenticate, (req, res) =>
  chatController.getSessionMessages(req, res)
);

router.post('/call-staff', authenticate, (req, res) =>
  chatController.callStaff(req, res)
);

router.post('/stop-staff', authenticate, (req, res) =>
  chatController.stopStaff(req, res)
);

router.post('/accept-call', authenticate, requireRole(Role.OWNER), (req, res) =>
  chatController.acceptCall(req, res)
);

router.post('/decline-call', authenticate, requireRole(Role.OWNER), (req, res) =>
  chatController.declineCall(req, res)
);

router.delete('/sessions/:sessionId', authenticate, (req, res) =>
  chatController.deleteSession(req, res)
);

router.delete('/history', authenticate, (req, res) =>
  chatController.clearHistory(req, res)
);

export default router;
