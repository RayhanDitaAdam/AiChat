import { Router } from 'express';
import * as reportController from './report.controller.js';
import { authenticate } from '../../common/middleware/auth.middleware.js';

const router = Router();

router.get('/sales', authenticate as any, reportController.getSalesAnalytics);
router.get('/top-products', authenticate as any, reportController.getTopSellingProducts);
router.get('/stock-alerts', authenticate as any, reportController.getStockAlerts);

export default router;
