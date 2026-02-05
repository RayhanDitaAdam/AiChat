import { Router, type Router as ExpressRouter } from 'express';
import { RewardController } from './reward.controller.js';
import { authenticate } from '../../common/middleware/auth.middleware.js';
import { validate } from '../../common/middleware/zod.middleware.js';
import { IssueRewardSchema, QRTransactionRewardSchema } from './reward.schema.js';
import { requireOwner, requireApproved } from '../../common/middleware/rbac.middleware.js';

const router: ExpressRouter = Router();
const rewardController = new RewardController();

// USER/MEMBER routes
router.get('/my-activities', authenticate, (req, res) => rewardController.getMyActivities(req, res));

// OWNER routes
router.post('/issue',
    authenticate,
    requireOwner(),
    requireApproved(),
    validate(IssueRewardSchema),
    (req, res) => rewardController.issueReward(req, res)
);

router.post('/process-qr',
    authenticate,
    requireOwner(),
    requireApproved(),
    validate(QRTransactionRewardSchema),
    (req, res) => rewardController.processQRTransaction(req, res)
);

router.get('/export',
    authenticate,
    requireOwner(),
    requireApproved(),
    (req, res) => rewardController.exportToCSV(req, res)
);

export default router;
