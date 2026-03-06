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

 

