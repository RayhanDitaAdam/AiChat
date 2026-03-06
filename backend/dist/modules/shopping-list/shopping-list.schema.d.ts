import { z } from 'zod';
export declare const AddToShoppingListSchema: z.ZodObject<{
    body: z.ZodObject<{
        productId: z.ZodString;
        quantity: z.ZodDefault<z.ZodNumber>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const RemoveFromShoppingListSchema: z.ZodObject<{
    params: z.ZodObject<{
        itemId: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
export type AddToShoppingListInput = z.infer<typeof AddToShoppingListSchema>['body'];
//# sourceMappingURL=shopping-list.schema.d.ts.map