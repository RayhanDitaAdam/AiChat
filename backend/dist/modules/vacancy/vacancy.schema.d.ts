import { z } from 'zod';
export declare const CreateVacancySchema: z.ZodObject<{
    body: z.ZodObject<{
        companyName: z.ZodString;
        address: z.ZodString;
        phone: z.ZodString;
        title: z.ZodString;
        detail: z.ZodString;
        salary: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const UpdateVacancySchema: z.ZodObject<{
    body: z.ZodObject<{
        companyName: z.ZodOptional<z.ZodString>;
        address: z.ZodOptional<z.ZodString>;
        phone: z.ZodOptional<z.ZodString>;
        title: z.ZodOptional<z.ZodString>;
        detail: z.ZodOptional<z.ZodString>;
        salary: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    }, z.core.$strip>;
    params: z.ZodObject<{
        id: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const CreateApplicationSchema: z.ZodObject<{
    params: z.ZodObject<{
        vacancyId: z.ZodString;
    }, z.core.$strip>;
    body: z.ZodObject<{
        reason: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const UpdateApplicationStatusSchema: z.ZodObject<{
    body: z.ZodObject<{
        status: z.ZodEnum<{
            ACCEPTED: "ACCEPTED";
            REJECTED: "REJECTED";
            PENDING: "PENDING";
            REVIEWED: "REVIEWED";
        }>;
    }, z.core.$strip>;
    params: z.ZodObject<{
        id: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
export type CreateVacancyInput = z.infer<typeof CreateVacancySchema>['body'];
export type UpdateVacancyInput = z.infer<typeof UpdateVacancySchema>['body'];
export type UpdateApplicationStatusInput = z.infer<typeof UpdateApplicationStatusSchema>['body'];
//# sourceMappingURL=vacancy.schema.d.ts.map