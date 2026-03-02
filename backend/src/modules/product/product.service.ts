import { prisma } from '../../common/services/prisma.service.js';

export class ProductService {
    /**
     * Get all products by owner ID
     * Users can access any owner's products
     * Owners can only access their own products (enforced by middleware)
     */
    async getProductsByOwner(ownerId: string, search?: string, data?: { status?: string }) {
        const owner = await prisma.owner.findUnique({
            where: { id: ownerId },
        });

        if (!owner) {
            throw new Error('Owner not found');
        }

        const where: any = { owner_id: ownerId };

        // Default to showing only APPROVED products unless specified otherwise
        // (Staff/Owner might want to see PENDING)
        if (data?.status) {
            if (data.status === 'ALL') {
                // No status filter = all products
            } else {
                where.status = data.status;
            }
        } else {
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
                },
                expiryItems: {
                    include: {
                        productExpiry: true
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

    async createProduct(ownerId: string, data: any, contributorId?: string) {
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

    async updateProduct(productId: string, ownerId: string, data: any, contributorId?: string) {
        const where: any = { id: productId, owner_id: ownerId };
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

    async deleteProduct(productId: string, ownerId: string, contributorId?: string) {
        const where: any = { id: productId, owner_id: ownerId };
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

        await prisma.$transaction([
            prisma.shoppingListItem.deleteMany({
                where: { product_id: productId }
            }),
            prisma.transactionItem.deleteMany({
                where: { productId }
            }),
            prisma.productPromo.deleteMany({
                where: { productId }
            }),
            prisma.product.delete({
                where: { id: productId }
            })
        ]);

        return {
            status: 'success',
            message: 'Product deleted successfully',
        };
    }

    async bulkDeleteProducts(productIds: string[], ownerId: string) {
        // Only delete products that belong to the owner
        // First get actual product IDs belonging to the owner to avoid deleting others' items
        const ownerProducts = await prisma.product.findMany({
            where: {
                id: { in: productIds },
                owner_id: ownerId
            },
            select: { id: true }
        });

        const validProductIds = ownerProducts.map(p => p.id);

        if (validProductIds.length === 0) {
            return {
                status: 'success',
                message: 'No products deleted',
                count: 0
            };
        }

        // Delete dependencies first within a transaction
        const [delShoppingTasks, delTxItems, delPromos, result] = await prisma.$transaction([
            prisma.shoppingListItem.deleteMany({
                where: { product_id: { in: validProductIds } }
            }),
            prisma.transactionItem.deleteMany({
                where: { productId: { in: validProductIds } }
            }),
            prisma.productPromo.deleteMany({
                where: { productId: { in: validProductIds } }
            }),
            prisma.product.deleteMany({
                where: { id: { in: validProductIds } }
            })
        ]);

        return {
            status: 'success',
            message: `${result.count} products deleted successfully`,
            count: result.count
        };
    }

    async updateProductStatus(productId: string, ownerId: string, status: 'APPROVED' | 'REJECTED') {
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

    async bulkUpdateProductStatus(productIds: string[], ownerId: string, status: 'APPROVED' | 'REJECTED') {
        const result = await prisma.product.updateMany({
            where: {
                id: { in: productIds },
                owner_id: ownerId,
                status: 'PENDING' // Only allow updating pending products in bulk
            },
            data: { status }
        });

        return {
            status: 'success',
            message: `${result.count} products ${status.toLowerCase()} successfully`,
            count: result.count
        };
    }

    async bulkCreateProducts(ownerId: string, productsData: any[]) {
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
    async identifyFastMovingProducts(ownerId: string) {
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
