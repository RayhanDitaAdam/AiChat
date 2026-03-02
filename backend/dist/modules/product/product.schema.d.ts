import { z } from 'zod';
export declare const CreateProductSchema: z.ZodObject<{
    body: z.ZodObject<{
        name: z.ZodString;
        price: z.ZodPipe<z.ZodTransform<number, unknown>, z.ZodNumber>;
        purchasePrice: z.ZodOptional<z.ZodPipe<z.ZodTransform<number, unknown>, z.ZodNumber>>;
        stock: z.ZodPipe<z.ZodTransform<number, unknown>, z.ZodNumber>;
        aisle: z.ZodString;
        rak: z.ZodString;
        category: z.ZodString;
        halal: z.ZodDefault<z.ZodPipe<z.ZodTransform<boolean, unknown>, z.ZodBoolean>>;
        description: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        map_url: z.ZodNullable<z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>>;
        videoUrl: z.ZodNullable<z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>>;
        ingredients: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        isFastMoving: z.ZodDefault<z.ZodPipe<z.ZodTransform<boolean, unknown>, z.ZodBoolean>>;
        isSecondHand: z.ZodDefault<z.ZodPipe<z.ZodTransform<boolean, unknown>, z.ZodBoolean>>;
        productType: z.ZodDefault<z.ZodEnum<{
            sewa: "sewa";
            jual: "jual";
        }>>;
        bedType: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        room: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        section: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        view360Url: z.ZodNullable<z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const UpdateProductSchema: z.ZodObject<{
    body: z.ZodObject<{
        name: z.ZodOptional<z.ZodString>;
        price: z.ZodPipe<z.ZodTransform<unknown, unknown>, z.ZodOptional<z.ZodNumber>>;
        purchasePrice: z.ZodPipe<z.ZodTransform<unknown, unknown>, z.ZodOptional<z.ZodNumber>>;
        stock: z.ZodPipe<z.ZodTransform<unknown, unknown>, z.ZodOptional<z.ZodNumber>>;
        aisle: z.ZodOptional<z.ZodString>;
        rak: z.ZodOptional<z.ZodString>;
        category: z.ZodOptional<z.ZodString>;
        halal: z.ZodPipe<z.ZodTransform<boolean, unknown>, z.ZodOptional<z.ZodBoolean>>;
        description: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        map_url: z.ZodNullable<z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>>;
        videoUrl: z.ZodNullable<z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>>;
        ingredients: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        isFastMoving: z.ZodPipe<z.ZodTransform<boolean, unknown>, z.ZodOptional<z.ZodBoolean>>;
        isSecondHand: z.ZodPipe<z.ZodTransform<boolean, unknown>, z.ZodOptional<z.ZodBoolean>>;
        productType: z.ZodOptional<z.ZodEnum<{
            sewa: "sewa";
            jual: "jual";
        }>>;
        bedType: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        room: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        section: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        view360Url: z.ZodNullable<z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>>;
    }, z.core.$strip>;
    params: z.ZodObject<{
        id: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const CreatePromoSchema: z.ZodObject<{
    body: z.ZodObject<{
        productId: z.ZodString;
        type: z.ZodEnum<{
            DISCOUNT: "DISCOUNT";
            FREE: "FREE";
        }>;
        promoPrice: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
        discountPercent: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
        freeItemName: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        startDate: z.ZodString;
        endDate: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
export type CreateProductInput = z.infer<typeof CreateProductSchema>['body'];
export type UpdateProductInput = z.infer<typeof UpdateProductSchema>['body'];
export type CreatePromoInput = z.infer<typeof CreatePromoSchema>['body'];
//# sourceMappingURL=product.schema.d.ts.map