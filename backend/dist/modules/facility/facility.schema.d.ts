import { z } from 'zod';
export declare const createFacilityTaskSchema: z.ZodObject<{
    location: z.ZodString;
    taskDetail: z.ZodString;
    taskDate: z.ZodString;
    assignedToId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    subLocationId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    assignScope: z.ZodDefault<z.ZodOptional<z.ZodEnum<{
        ALL: "ALL";
        INDIVIDUAL: "INDIVIDUAL";
        ROLE: "ROLE";
    }>>>;
    targetRole: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const updateFacilityTaskReportSchema: z.ZodObject<{
    report: z.ZodString;
    status: z.ZodOptional<z.ZodEnum<{
        PENDING: "PENDING";
        COMPLETED: "COMPLETED";
    }>>;
}, z.core.$strip>;
export declare const updateFacilityTaskSchema: z.ZodObject<{
    location: z.ZodOptional<z.ZodString>;
    taskDetail: z.ZodOptional<z.ZodString>;
    taskDate: z.ZodOptional<z.ZodString>;
    assignedToId: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
    subLocationId: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
    assignScope: z.ZodOptional<z.ZodDefault<z.ZodOptional<z.ZodEnum<{
        ALL: "ALL";
        INDIVIDUAL: "INDIVIDUAL";
        ROLE: "ROLE";
    }>>>>;
    targetRole: z.ZodOptional<z.ZodOptional<z.ZodString>>;
}, z.core.$strip>;
export type CreateFacilityTaskInput = z.infer<typeof createFacilityTaskSchema>;
export type UpdateFacilityTaskReportInput = z.infer<typeof updateFacilityTaskReportSchema>;
export type UpdateFacilityTaskInput = z.infer<typeof updateFacilityTaskSchema>;
//# sourceMappingURL=facility.schema.d.ts.map