import { z } from 'zod';

export const CreateProductSchema = z.object({
    body: z.object({
        name: z.string().min(1, 'Product name is required'),
        price: z.preprocess((val) => parseFloat(val ), z.number().min(0, 'Price cannot be negative')),
        purchasePrice: z.preprocess((val) => parseFloat(val ), z.number().min(0, 'Cost price cannot be negative')).optional(),
        stock: z.preprocess((val) => parseInt(val ), z.number().int().min(0, 'Stock cannot be negative')),
        aisle: z.string().min(1, 'Aisle is required'),
        rak: z.string().min(1, 'Rak is required'),
        category: z.string().min(1, 'Category is required'),
        halal: z.preprocess((val) => val === 'true' || val === true, z.boolean()).default(true),
        description: z.string().optional().nullable(),
        map_url: z.string().url().optional().or(z.literal('')).nullable(),
        videoUrl: z.string().url().optional().or(z.literal('')).nullable(),
        ingredients: z.string().optional().nullable(),
        isFastMoving: z.preprocess((val) => val === 'true' || val === true, z.boolean()).default(false),
        isSecondHand: z.preprocess((val) => val === 'true' || val === true, z.boolean()).default(false),
        productType: z.enum(['jual', 'sewa']).default('jual'),
        bedType: z.string().optional().nullable(),
        room: z.string().optional().nullable(),
        section: z.string().optional().nullable(),
        view360Url: z.string().url().optional().or(z.literal('')).nullable(),
    }),
});

export const UpdateProductSchema = z.object({
    body: z.object({
        name: z.string().optional(),
        price: z.preprocess((val) => typeof val === 'string' ? parseFloat(val) : val, z.number().min(0).optional()),
        purchasePrice: z.preprocess((val) => typeof val === 'string' ? parseFloat(val) : val, z.number().min(0).optional()),
        stock: z.preprocess((val) => typeof val === 'string' ? parseInt(val) : val, z.number().int().min(0).optional()),
        aisle: z.string().optional(),
        rak: z.string().optional(),
        category: z.string().optional(),
        halal: z.preprocess((val) => val === 'true' || val === true, z.boolean().optional()),
        description: z.string().optional().nullable(),
        map_url: z.string().url().optional().or(z.literal('')).nullable(),
        videoUrl: z.string().url().optional().or(z.literal('')).nullable(),
        ingredients: z.string().optional().nullable(),
        isFastMoving: z.preprocess((val) => val === 'true' || val === true, z.boolean().optional()),
        isSecondHand: z.preprocess((val) => val === 'true' || val === true, z.boolean().optional()),
        productType: z.enum(['jual', 'sewa']).optional(),
        bedType: z.string().optional().nullable(),
        room: z.string().optional().nullable(),
        section: z.string().optional().nullable(),
        view360Url: z.string().url().optional().or(z.literal('')).nullable(),
    }),
    params: z.object({
        id: z.string().uuid('Invalid product ID'),
    }),
});

export const CreatePromoSchema = z.object({
    body: z.object({
        productId: z.string().uuid(),
        type: z.enum(['DISCOUNT', 'FREE']),
        promoPrice: z.number().optional().nullable(),
        discountPercent: z.number().optional().nullable(),
        freeItemName: z.string().optional().nullable(),
        startDate: z.string().datetime(),
        endDate: z.string().datetime(),
    }),
});

 


