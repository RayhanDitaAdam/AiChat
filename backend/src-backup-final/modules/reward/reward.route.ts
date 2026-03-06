import { Router } from 'express';
import * as rewardController from './reward.controller.js';
import { authenticate } from '../../common/middleware/auth.middleware.js';

const router = Router();

router.get('/', authenticate as any, rewardController.getRewards);
router.post('/', authenticate as any, rewardController.createReward);
router.post('/redeem', authenticate as any, rewardController.redeemReward);

export default router;
