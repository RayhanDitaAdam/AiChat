import { z } from 'zod';
export declare const SalesAnalyticsQuerySchema: z.ZodObject<{
    query: z.ZodObject<{
        period: z.ZodDefault<z.ZodOptional<z.ZodEnum<{
            daily: "daily";
            monthly: "monthly";
        }>>>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const ComprehensiveReportQuerySchema: z.ZodObject<{
    query: z.ZodObject<{
        startDate: z.ZodOptional<z.ZodString>;
        endDate: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const TopProductsQuerySchema: z.ZodObject<{
    query: z.ZodObject<{
        limit: z.ZodDefault<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const StockAlertsQuerySchema: z.ZodObject<{
    query: z.ZodObject<{
        threshold: z.ZodDefault<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
    }, z.core.$strip>;
}, z.core.$strip>;
//# sourceMappingURL=report.schema.d.ts.map