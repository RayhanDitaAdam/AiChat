import { Router, type Router as ExpressRouter } from 'express';
import { ChatController } from './chat.controller.js';
import { ManagementChatController } from './management-chat.controller.js';
import { authenticate, authenticateOptional } from '../../common/middleware/auth.middleware.js';

import { ChatSchema } from './chat.schema.js';
import { validate } from '../../common/middleware/zod.middleware.js';

const router: ExpressRouter = Router();
const chatController = new ChatController();
const managementChatController = new ManagementChatController();

// Existing routes
router.post('/', authenticateOptional, validate(ChatSchema), (req, res) => chatController.handleChat(req, res));
router.get('/history', authenticate, (req, res) => chatController.getHistory(req, res));
router.post('/sessions', authenticate, (req, res) => chatController.createSession(req, res));
router.get('/sessions/:sessionId/messages', authenticate, (req, res) => chatController.getSessionMessages(req, res));
router.delete('/sessions/:sessionId', authenticate, (req, res) => chatController.deleteSession(req, res));
router.post('/clear-history', authenticate, (req, res) => chatController.clearHistory(req, res));

// Staff support routes
router.get('/store-staff/:ownerId', authenticateOptional, (req, res) => chatController.getStoreStaff(req, res));
router.post('/call-staff', authenticate, (req, res) => chatController.callStaff(req, res));
router.post('/stop-staff', authenticate, (req, res) => chatController.stopStaff(req, res));
router.post('/accept-call', authenticate, (req, res) => chatController.acceptCall(req, res));
router.post('/decline-call', authenticate, (req, res) => chatController.declineCall(req, res));

// NEW: Management AI Chat
router.post('/management', authenticate, (req, res) => managementChatController.chat(req, res));

export default router;
