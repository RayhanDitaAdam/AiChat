import { Router } from 'express';
import * as transactionController from './transaction.controller.js';
import { authMiddleware } from '../../middleware/auth.middleware.js';

const router = Router();

router.post('/', authMiddleware as any, transactionController.createTransaction as any);
router.get('/', authMiddleware as any, transactionController.getTransactions);
router.get('/:id', authMiddleware as any, transactionController.getTransactionById);

export default router;
