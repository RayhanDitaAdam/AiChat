import { Router } from 'express';
import * as healthController from './health.controller.js';
import { authenticate } from '../../common/middleware/auth.middleware.js';
import { upload } from '../../common/middleware/upload.middleware.js';

const router = Router();

router.post('/medical-record', authenticate , upload.single('file'), healthController.saveMedicalRecord);
router.post('/analyze-food', authenticate , upload.single('file'), healthController.analyzeFood);
router.get('/history/:memberId', authenticate , healthController.getHealthHistory);

export default router;
