import { z } from 'zod';
export const createFacilityTaskSchema = z.object({
    location: z.string().min(1), // Can be enum or custom sub-location name
    taskDetail: z.string().min(1),
    taskDate: z.string().datetime(),
    assignedToId: z.string().uuid().optional().nullable(),
    subLocationId: z.string().uuid().optional().nullable(),
    assignScope: z.enum(['INDIVIDUAL', 'ROLE', 'ALL']).optional().default('INDIVIDUAL'),
    targetRole: z.string().optional(),
});
export const updateFacilityTaskReportSchema = z.object({
    report: z.string().min(1),
    status: z.enum(['PENDING', 'COMPLETED']).optional(),
});
//# sourceMappingURL=facility.schema.js.map