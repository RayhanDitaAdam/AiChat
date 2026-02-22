import { prisma } from '../../common/services/prisma.service.js';
export class ProductService {
    /**
     * Get all products by owner ID
     * Users can access any owner's products
     * Owners can only access their own products (enforced by middleware)
     */
    async getProductsByOwner(ownerId, search, data) {
        const owner = await prisma.owner.findUnique({
            where: { id: ownerId },
        });
        if (!owner) {
            throw new Error('Owner not found');
        }
        const where = { owner_id: ownerId };
        // Default to showing only APPROVED products unless specified otherwise
        // (Staff/Owner might want to see PENDING)
        if (data?.status) {
            if (data.status === 'ALL') {
                // No status filter = all products
            }
            else {
                where.status = data.status;
            }
        }
        else {
            where.status = 'APPROVED';
        }
        if (search) {
            where.AND = [
                { status: where.status },
                {
                    OR: [
                        { name: { contains: search, mode: 'insensitive' } },
                        { category: { contains: search, mode: 'insensitive' } },
                        { description: { contains: search, mode: 'insensitive' } },
                    ]
                }
            ];
            delete where.status; // Moved into AND
        }
        const products = await prisma.product.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            include: {
                contributor: {
                    select: {
                        name: true
                    }
                }
            }
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
    async createProduct(ownerId, data, contributorId) {
        const product = await prisma.product.create({
            data: {
                ...data,
                owner_id: ownerId,
                contributorId: contributorId,
                status: contributorId ? 'PENDING' : 'APPROVED',
                expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
            },
        });
        return {
            status: 'success',
            message: 'Product created successfully',
            product,
        };
    }
    async updateProduct(productId, ownerId, data, contributorId) {
        const where = { id: productId, owner_id: ownerId };
        if (contributorId) {
            where.contributorId = contributorId;
        }
        const existing = await prisma.product.findFirst({
            where,
        });
        if (!existing) {
            throw new Error('Product not found or access denied');
        }
        if (contributorId && existing.status === 'APPROVED') {
            throw new Error('Cannot update an approved product. Please contact the owner.');
        }
        const product = await prisma.product.update({
            where: { id: productId },
            data: {
                ...data,
                expiryDate: data.expiryDate ? new Date(data.expiryDate) : (data.expiryDate === null ? null : undefined),
            },
        });
        return {
            status: 'success',
            message: 'Product updated successfully',
            product,
        };
    }
    async deleteProduct(productId, ownerId, contributorId) {
        const where = { id: productId, owner_id: ownerId };
        if (contributorId) {
            where.contributorId = contributorId;
        }
        const existing = await prisma.product.findFirst({
            where,
        });
        if (!existing) {
            throw new Error('Product not found or access denied');
        }
        if (contributorId && existing.status === 'APPROVED') {
            throw new Error('Cannot delete an approved product. Please contact the owner.');
        }
        await prisma.product.delete({
            where: { id: productId },
        });
        return {
            status: 'success',
            message: 'Product deleted successfully',
        };
    }
    async updateProductStatus(productId, ownerId, status) {
        const product = await prisma.product.findFirst({
            where: { id: productId, owner_id: ownerId }
        });
        if (!product) {
            throw new Error('Product not found');
        }
        const updated = await prisma.product.update({
            where: { id: productId },
            data: { status }
        });
        return {
            status: 'success',
            message: `Product ${status.toLowerCase()} successfully`,
            product: updated
        };
    }
    async bulkCreateProducts(ownerId, productsData) {
        const products = productsData.map(p => ({
            ...p,
            owner_id: ownerId,
            expiryDate: p.expiryDate ? new Date(p.expiryDate) : null,
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
    async identifyFastMovingProducts(ownerId) {
        // High missing requests = potential fast moving high demand
        const missingRequests = await prisma.missingRequest.findMany({
            where: { ownerId: ownerId },
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
            .filter(p => p.isFastMoving || p._count.shoppingListItems > 5)
            .map(p => ({
            id: p.id,
            name: p.name,
            stock: p.stock,
            intentCount: p._count.shoppingListItems,
            reason: p.isFastMoving ? 'Owner Marked' : 'High Shopping Intent'
        }));
        return {
            status: 'success',
            fastMoving,
            demandedFromMissing: missingRequests
        };
    }
    async createProductPromo(ownerId, data) {
        const product = await prisma.product.findFirst({
            where: { id: data.productId, owner_id: ownerId }
        });
        if (!product) {
            throw new Error('Product not found in your store');
        }
        const promo = await prisma.productPromo.create({
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
    async getPromosByOwner(ownerId) {
        const promos = await prisma.productPromo.findMany({
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
//# sourceMappingURL=product.service.js.map