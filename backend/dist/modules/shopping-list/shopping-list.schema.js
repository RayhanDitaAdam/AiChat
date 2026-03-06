import { z } from 'zod';
export const AddToShoppingListSchema = z.object({
    body: z.object({
        productId: z.string().uuid('Invalid product ID'),
        quantity: z.number().int().min(1).default(1),
    }),
});
export const RemoveFromShoppingListSchema = z.object({
    params: z.object({
        itemId: z.string().uuid('Invalid item ID'),
    }),
});
//# sourceMappingURL=shopping-list.schema.js.map