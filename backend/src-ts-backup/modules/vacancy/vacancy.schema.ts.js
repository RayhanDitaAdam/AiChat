import { z } from "zod";

export const CreateVacancySchema = z.object({
  body: z.object({
    companyName: z.string().trim().min(1, "Company name is required"),
    address: z.string().trim().min(1, "Address is required"),
    phone: z.string().trim().min(1, "Phone is required"),
    title: z.string().trim().min(1, "Job title is required"),
    detail: z.string().trim().min(1, "Job details are required"),
    salary: z.string().trim().optional().nullable(),
  }),
});

export const UpdateVacancySchema = z.object({
  body: z.object({
    companyName: z.string().trim().optional(),
    address: z.string().trim().optional(),
    phone: z.string().trim().optional(),
    title: z.string().trim().optional(),
    detail: z.string().trim().optional(),
    salary: z.string().trim().optional().nullable(),
  }),
  params: z.object({
    id: z.string().uuid("Invalid vacancy ID"),
  }),
});

export const CreateApplicationSchema = z.object({
  params: z.object({
    vacancyId: z.string().uuid("Invalid vacancy ID"),
  }),
  body: z.object({
    reason: z
      .string()
      .trim()
      .min(10, "Please provide a reason (min 10 characters)"),
  }),
});

export const UpdateApplicationStatusSchema = z.object({
  body: z.object({
    status: z.enum(["PENDING", "REVIEWED", "REJECTED", "ACCEPTED"]),
  }),
  params: z.object({
    id: z.string().uuid("Invalid application ID"),
  }),
});
