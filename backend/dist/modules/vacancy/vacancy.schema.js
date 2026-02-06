import { z } from 'zod';
export const CreateVacancySchema = z.object({
    body: z.object({
        companyName: z.string().min(1, 'Company name is required'),
        address: z.string().min(1, 'Address is required'),
        phone: z.string().min(1, 'Phone is required'),
        title: z.string().min(1, 'Job title is required'),
        detail: z.string().min(1, 'Job details are required'),
        salary: z.string().optional().nullable(),
    }),
});
export const UpdateVacancySchema = z.object({
    body: z.object({
        companyName: z.string().optional(),
        address: z.string().optional(),
        phone: z.string().optional(),
        title: z.string().optional(),
        detail: z.string().optional(),
        salary: z.string().optional().nullable(),
    }),
    params: z.object({
        id: z.string().uuid('Invalid vacancy ID'),
    }),
});
//# sourceMappingURL=vacancy.schema.js.map