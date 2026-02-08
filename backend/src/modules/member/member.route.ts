import { Router } from 'express';
import * as memberController from './member.controller.js';
import { authenticate } from '../../common/middleware/auth.middleware.js';

const router = Router();

router.get('/', authenticate as any, memberController.getMembers);
router.get('/:id', authenticate as any, memberController.getMemberDetail);

export default router;
