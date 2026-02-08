import { Router } from 'express';
import * as rewardController from './reward.controller.js';
import { authenticate } from '../../common/middleware/auth.middleware.js';
const router = Router();
router.get('/', authenticate, rewardController.getRewards);
router.post('/', authenticate, rewardController.createReward);
router.post('/redeem', authenticate, rewardController.redeemReward);
export default router;
//# sourceMappingURL=reward.route.js.map