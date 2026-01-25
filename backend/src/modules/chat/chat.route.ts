import { Router, type Router as ExpressRouter } from 'express';
import { ChatController } from './chat.controller.js';
import { ChatSchema } from './chat.schema.js';
import { validate } from '../../common/middleware/zod.middleware.js';
import { authenticate } from '../../common/middleware/auth.middleware.js';
import { requireUser } from '../../common/middleware/rbac.middleware.js';

const router: ExpressRouter = Router();
const chatController = new ChatController();

router.post('/', authenticate, requireUser(), validate(ChatSchema), (req, res) =>
  chatController.handleChat(req, res)
);

export default router;
