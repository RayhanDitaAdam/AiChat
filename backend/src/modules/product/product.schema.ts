import { z } from 'zod';

export const CreateProductSchema = z.object({
    body: z.object({
        name: z.string().min(1, 'Product name is required'),
        price: z.number().min(0, 'Price cannot be negative'),
        stock: z.number().int().min(0, 'Stock cannot be negative'),
        aisle: z.string().min(1, 'Aisle is required'),
        section: z.string().min(1, 'Section is required'),
        category: z.string().min(1, 'Category is required'),
        halal: z.boolean().default(true),
        map_url: z.string().url().optional().or(z.literal('')),
    }),
});

export const UpdateProductSchema = z.object({
    body: z.object({
        name: z.string().optional(),
        price: z.number().min(0).optional(),
        stock: z.number().int().min(0).optional(),
        aisle: z.string().optional(),
        section: z.string().optional(),
        category: z.string().optional(),
        halal: z.boolean().optional(),
        map_url: z.string().url().optional().or(z.literal('')),
    }),
    params: z.object({
        id: z.string().uuid('Invalid product ID'),
    }),
});

export type CreateProductInput = z.infer<typeof CreateProductSchema>['body'];
export type UpdateProductInput = z.infer<typeof UpdateProductSchema>['body'];
