import { prisma } from '../../common/services/prisma.service.js';

export class ProductService {
    /**
     * Get all products by owner ID
     * Users can access any owner's products
     * Owners can only access their own products (enforced by middleware)
     */
    async getProductsByOwner(ownerId: string) {
        const owner = await prisma.owner.findUnique({
            where: { id: ownerId },
        });

        if (!owner) {
            throw new Error('Owner not found');
        }

        const products = await prisma.product.findMany({
            where: { owner_id: ownerId },
            orderBy: { createdAt: 'desc' },
        });

        return {
            status: 'success',
            owner: {
                id: owner.id,
                name: owner.name,
                domain: owner.domain,
            },
            products,
        };
    }

    async createProduct(ownerId: string, data: any) {
        const product = await prisma.product.create({
            data: {
                ...data,
                owner_id: ownerId,
            },
        });

        return {
            status: 'success',
            message: 'Product created successfully',
            product,
        };
    }

    async updateProduct(productId: string, ownerId: string, data: any) {
        const existing = await prisma.product.findFirst({
            where: { id: productId, owner_id: ownerId },
        });

        if (!existing) {
            throw new Error('Product not found or access denied');
        }

        const product = await prisma.product.update({
            where: { id: productId },
            data,
        });

        return {
            status: 'success',
            message: 'Product updated successfully',
            product,
        };
    }

    async deleteProduct(productId: string, ownerId: string) {
        const existing = await prisma.product.findFirst({
            where: { id: productId, owner_id: ownerId },
        });

        if (!existing) {
            throw new Error('Product not found or access denied');
        }

        await prisma.product.delete({
            where: { id: productId },
        });

        return {
            status: 'success',
            message: 'Product deleted successfully',
        };
    }

    async bulkCreateProducts(ownerId: string, productsData: any[]) {
        const products = productsData.map(p => ({
            ...p,
            owner_id: ownerId,
        }));

        const result = await prisma.product.createMany({
            data: products,
            skipDuplicates: false,
        });

        return {
            status: 'success',
            message: `${result.count} products created successfully`,
            count: result.count,
        };
    }

    /**
     * Identify fast-moving products based on MissingRequests and ShoppingList usage
     */
    async identifyFastMovingProducts(ownerId: string) {
        // High missing requests = potential fast moving high demand
        const missingRequests = await prisma.missingRequest.findMany({
            where: { owner_id: ownerId },
            orderBy: { count: 'desc' },
            take: 10
        });

        const products = await prisma.product.findMany({
            where: { owner_id: ownerId },
            include: {
                _count: {
                    select: { shoppingListItems: true }
                }
            }
        });

        // Simple scoring: Explicitly marked OR high shopping list count
        const fastMoving = products
            .filter(p => (p as any).isFastMoving || p._count.shoppingListItems > 5)
            .map(p => ({
                id: p.id,
                name: p.name,
                stock: p.stock,
                intentCount: p._count.shoppingListItems,
                reason: (p as any).isFastMoving ? 'Owner Marked' : 'High Shopping Intent'
            }));

        return {
            status: 'success',
            fastMoving,
            demandedFromMissing: missingRequests
        };
    }

    async createProductPromo(ownerId: string, data: any) {
        const product = await prisma.product.findFirst({
            where: { id: data.productId, owner_id: ownerId }
        });

        if (!product) {
            throw new Error('Product not found in your store');
        }

        const promo = await (prisma as any).productPromo.create({
            data: {
                ...data,
                startDate: new Date(data.startDate),
                endDate: new Date(data.endDate),
            }
        });

        return {
            status: 'success',
            message: 'Promotion created successfully',
            promo
        };
    }

    async getPromosByOwner(ownerId: string) {
        const promos = await (prisma as any).productPromo.findMany({
            where: {
                product: { owner_id: ownerId }
            },
            include: {
                product: {
                    select: { name: true, image: true, price: true }
                }
            }
        });

        return { status: 'success', promos };
    }
}
