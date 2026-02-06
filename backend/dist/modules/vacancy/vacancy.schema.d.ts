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
export type CreateVacancyInput = z.infer<typeof CreateVacancySchema>['body'];
export type UpdateVacancyInput = z.infer<typeof UpdateVacancySchema>['body'];
//# sourceMappingURL=vacancy.schema.d.ts.map