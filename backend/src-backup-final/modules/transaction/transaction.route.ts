import { Router } from 'express';
import * as transactionController from './transaction.controller.js';
import { authenticate } from '../../common/middleware/auth.middleware.js';

const router = Router();

router.post('/', authenticate as any, transactionController.createTransaction);
router.get('/', authenticate as any, transactionController.getTransactions);
router.get('/:id', authenticate as any, transactionController.getTransactionById);

export default router;
