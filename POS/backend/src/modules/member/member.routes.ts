import { Router } from 'express';
import * as memberController from './member.controller.js';
import { authMiddleware } from '../../middleware/auth.middleware.js';

const router = Router();

router.get('/', authMiddleware as any, memberController.getMembers);
router.get('/:id', authMiddleware as any, memberController.getMemberDetail);

export default router;
