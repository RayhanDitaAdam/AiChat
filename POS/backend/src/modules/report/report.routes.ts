import { Router } from 'express';
import * as reportController from './report.controller.js';
import { authMiddleware, roleMiddleware } from '../../middleware/auth.middleware.js';

const router = Router();

router.get('/analytics/sales', authMiddleware as any, reportController.getSalesAnalytics);
router.get('/analytics/top-products', authMiddleware as any, reportController.getTopSellingProducts);
router.get('/analytics/stock-alerts', authMiddleware as any, reportController.getStockAlerts);

export default router;
