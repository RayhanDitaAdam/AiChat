import { z } from "zod";
export declare const createContributorRequestSchema: z.ZodObject<{
    body: z.ZodObject<{
        ownerId: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const updateContributorRequestStatusSchema: z.ZodObject<{
    body: z.ZodObject<{
        status: z.ZodEnum<{
            REJECTED: "REJECTED";
            APPROVED: "APPROVED";
        }>;
    }, z.core.$strip>;
}, z.core.$strip>;
export type CreateContributorRequestDto = z.infer<typeof createContributorRequestSchema>["body"];
export type UpdateContributorRequestStatusDto = z.infer<typeof updateContributorRequestStatusSchema>["body"];
//# sourceMappingURL=contributor.schema.d.ts.map