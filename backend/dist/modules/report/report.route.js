import { Router } from 'express';
import * as reportController from './report.controller.js';
import { authenticate } from '../../common/middleware/auth.middleware.js';
const router = Router();
router.get('/sales', authenticate, reportController.getSalesAnalytics);
router.get('/top-products', authenticate, reportController.getTopSellingProducts);
router.get('/stock-alerts', authenticate, reportController.getStockAlerts);
export default router;
//# sourceMappingURL=report.route.js.map