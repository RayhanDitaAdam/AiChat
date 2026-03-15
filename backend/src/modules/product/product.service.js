function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }
import { prisma } from '../../common/services/prisma.service.js';
import { TableQuery } from '../../common/utils/table-query.util.js';

export class ProductService {
    /**
     * Get all products by owner ID with advanced TanStack Table support
     */
    async getProductsByOwner(ownerId, search, query = {}) {
        const owner = await prisma.owner.findUnique({
            where: { id: ownerId },
        });

        if (!owner) {
            throw new Error('Owner not found');
        }

        // Use TableQuery utility to parse TanStack Table parameters
        const { skip, take, orderBy, where: tableWhere } = TableQuery.parseAll(query, {
            schemaMapping: {
                price: { type: 'number' },
                stock: { type: 'number' },
                halal: { type: 'boolean' },
                isFastMoving: { type: 'boolean' },
                isSecondHand: { type: 'boolean' },
                status: { type: 'string', mode: 'equals' }
            }
        });

        const where = { 
            owner_id: ownerId,
            ...tableWhere
        };

        // Backward compatibility for simple status filter
        if (query.status && !tableWhere.status) {
            if (query.status !== 'ALL') {
                where.status = query.status;
            }
        } else if (!where.status) {
            where.status = 'APPROVED';
        }

        // Backward compatibility for simple search
        if (search) {
            where.AND = [
                { status: where.status },
                {
                    OR: [
                        { name: { contains: search, mode: 'insensitive' } },
                        { barcode: { contains: search, mode: 'insensitive' } },
                        { category: { contains: search, mode: 'insensitive' } },
                        { description: { contains: search, mode: 'insensitive' } },
                    ]
                }
            ];
            delete where.status;
        }

        const [products, total] = await prisma.$transaction([
            prisma.product.findMany({
                where,
                orderBy: orderBy || { createdAt: 'desc' },
                skip,
                take,
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
            }),
            prisma.product.count({ where })
        ]);

        return {
            status: 'success',
            owner: {
                id: owner.id,
                name: owner.name,
                domain: owner.domain,
            },
            products,
            pagination: {
                total,
                pageIndex: parseInt(query.pageIndex) || 0,
                pageSize: parseInt(query.pageSize) || 10,
                pageCount: Math.ceil(total / (parseInt(query.pageSize) || 10))
            }
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

    async bulkDeleteProducts(productIds, ownerId) {
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

    async bulkUpdateProductStatus(productIds, ownerId, status) {
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
            .filter(p => (p).isFastMoving || p._count.shoppingListItems > 5)
            .map(p => ({
                id: p.id,
                name: p.name,
                stock: p.stock,
                intentCount: p._count.shoppingListItems,
                reason: (p).isFastMoving ? 'Owner Marked' : 'High Shopping Intent'
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

        const promo = await (prisma).productPromo.create({
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
        const promos = await (prisma).productPromo.findMany({
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
