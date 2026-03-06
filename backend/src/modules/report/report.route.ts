import { Router } from 'express';
import * as reportController from './report.controller.js';
import { authenticate } from '../../common/middleware/auth.middleware.js';
import { validate } from '../../common/middleware/zod.middleware.js';
import {
    SalesAnalyticsQuerySchema,
    ComprehensiveReportQuerySchema,
    TopProductsQuerySchema,
    StockAlertsQuerySchema,
} from './report.schema.js';

const router = Router();

router.get('/sales', authenticate as any, validate(SalesAnalyticsQuerySchema), reportController.getSalesAnalytics);
router.get('/comprehensive', authenticate as any, validate(ComprehensiveReportQuerySchema), reportController.getComprehensiveReport);
router.get('/top-products', authenticate as any, validate(TopProductsQuerySchema), reportController.getTopSellingProducts);
router.get('/stock-alerts', authenticate as any, validate(StockAlertsQuerySchema), reportController.getStockAlerts);

export default router;
