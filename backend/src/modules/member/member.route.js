import { Router } from 'express';
import * as memberController from './member.controller.js';
import { authenticate } from '../../common/middleware/auth.middleware.js';

const router = Router();

router.get('/', authenticate , memberController.getMembers);
router.get('/:id', authenticate , memberController.getMemberDetail);

export default router;
