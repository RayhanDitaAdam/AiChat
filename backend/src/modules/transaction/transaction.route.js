import { Router } from 'express';
import * as transactionController from './transaction.controller.js';
import { authenticate } from '../../common/middleware/auth.middleware.js';

const router = Router();

router.post('/', authenticate , transactionController.createTransaction);
router.get('/', authenticate , transactionController.getTransactions);
router.get('/:id', authenticate , transactionController.getTransactionById);

export default router;
