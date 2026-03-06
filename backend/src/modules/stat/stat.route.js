import { Router, } from 'express';
import { StatController } from './stat.controller.js';
import { authenticate } from '../../common/middleware/auth.middleware.js';

const router = Router();
const statController = new StatController();

router.get('/global', authenticate, (req, res) => statController.getGlobalStats(req, res));
router.get('/owner', authenticate, (req, res) => statController.getOwnerStats(req, res));

export default router;
