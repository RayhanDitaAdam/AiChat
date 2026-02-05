import { z } from 'zod';

export const createFacilityTaskSchema = z.object({
    location: z.enum(['Toilet', 'Prayer Room', 'Customer Service', 'AED', 'Emergency Phone', 'APAR']),
    taskDetail: z.string().min(1),
    taskDate: z.string().datetime(),
    assignedToId: z.string().uuid().optional().nullable(),
});

export const updateFacilityTaskReportSchema = z.object({
    report: z.string().min(1),
    status: z.enum(['PENDING', 'COMPLETED']).optional(),
});

export type CreateFacilityTaskInput = z.infer<typeof createFacilityTaskSchema>;
export type UpdateFacilityTaskReportInput = z.infer<typeof updateFacilityTaskReportSchema>;
