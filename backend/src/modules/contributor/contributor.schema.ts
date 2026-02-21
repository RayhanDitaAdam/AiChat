import { z } from "zod";

export const createContributorRequestSchema = z.object({
    body: z.object({
        ownerId: z.string(),
    }),
});

export const updateContributorRequestStatusSchema = z.object({
    body: z.object({
        status: z.enum(["APPROVED", "REJECTED"]),
    }),
});

export type CreateContributorRequestDto = z.infer<typeof createContributorRequestSchema>["body"];
export type UpdateContributorRequestStatusDto = z.infer<typeof updateContributorRequestStatusSchema>["body"];
