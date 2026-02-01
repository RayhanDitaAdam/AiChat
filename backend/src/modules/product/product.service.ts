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
}
