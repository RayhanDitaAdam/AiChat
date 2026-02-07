import { Router } from 'express';
import * as settingsController from './settings.controller.js';
import { authMiddleware, roleMiddleware } from '../../middleware/auth.middleware.js';

const router = Router();

router.get('/', authMiddleware as any, settingsController.getSettings);
router.patch('/', authMiddleware as any, roleMiddleware(['ADMIN']) as any, settingsController.updateSettings);

export default router;
