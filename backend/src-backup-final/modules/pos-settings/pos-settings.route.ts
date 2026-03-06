import { Router } from 'express';
import * as settingsController from './pos-settings.controller.js';
import { authenticate } from '../../common/middleware/auth.middleware.js';

const router = Router();

router.get('/', authenticate as any, settingsController.getSettings);
router.post('/', authenticate as any, settingsController.updateSettings);

export default router;
