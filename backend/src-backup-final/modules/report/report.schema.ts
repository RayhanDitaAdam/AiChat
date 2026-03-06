import { z } from 'zod';

export const SalesAnalyticsQuerySchema = z.object({
    query: z.object({
        period: z.enum(['daily', 'monthly']).optional().default('daily'),
    }),
});

export const ComprehensiveReportQuerySchema = z.object({
    query: z.object({
        startDate: z.string().optional(),
        endDate: z.string().optional(),
    }).refine((data) => {
        if (data.startDate && isNaN(Date.parse(data.startDate))) return false;
        if (data.endDate && isNaN(Date.parse(data.endDate))) return false;
        return true;
    }, {
        message: "Invalid date format for startDate or endDate",
        path: ["startDate"]
    }),
});

export const TopProductsQuerySchema = z.object({
    query: z.object({
        limit: z.coerce.number().int().min(1).max(50).optional().default(5),
    }),
});

export const StockAlertsQuerySchema = z.object({
    query: z.object({
        threshold: z.coerce.number().int().min(1).max(100).optional().default(10),
    }),
});
