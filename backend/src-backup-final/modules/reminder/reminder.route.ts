import { Router, type Router as ExpressRouter } from 'express';
import { ReminderController } from './reminder.controller.js';
import { CreateReminderSchema } from './reminder.schema.js';
import { validate } from '../../common/middleware/zod.middleware.js';
import { authenticate } from '../../common/middleware/auth.middleware.js';
import { requireUser } from '../../common/middleware/rbac.middleware.js';

const router: ExpressRouter = Router();
const reminderController = new ReminderController();

// POST /api/reminder - Create reminder (User role only)
router.post('/', authenticate, requireUser(), validate(CreateReminderSchema), (req, res) =>
    reminderController.createReminder(req, res)
);

export default router;
