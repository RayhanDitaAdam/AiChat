import { Router } from 'express';
import * as rewardController from './reward.controller.js';
import { authMiddleware, roleMiddleware } from '../../middleware/auth.middleware.js';

const router = Router();

router.get('/', authMiddleware as any, rewardController.getRewards);
router.post('/', authMiddleware as any, roleMiddleware(['ADMIN']) as any, rewardController.createReward);
router.post('/redeem', authMiddleware as any, rewardController.redeemReward);

export default router;
