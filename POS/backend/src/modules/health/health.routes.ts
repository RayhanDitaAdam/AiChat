import { Router } from 'express';
import * as healthController from './health.controller.js';
import { authMiddleware } from '../../middleware/auth.middleware.js';
import { upload } from '../../middleware/upload.middleware.js';

const router = Router();

router.post('/medical-record', authMiddleware as any, upload.single('file'), healthController.saveMedicalRecord);
router.post('/analyze-food', authMiddleware as any, upload.single('file'), healthController.analyzeFood);
router.get('/history/:memberId', authMiddleware as any, healthController.getHealthHistory);

export default router;
