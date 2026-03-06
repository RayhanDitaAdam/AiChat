import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class ExpiryService {
    async getExpiries(ownerId: string) {
        return prisma.productExpiry.findMany({
            where: { ownerId },
            include: {
                items: {
                    include: {
                        product: true
                    }
                }
            },
            orderBy: {
                date: 'asc'
            }
        });
    }

    async createExpiry(ownerId: string, date: Date) {
        return prisma.productExpiry.create({
            data: {
                ownerId,
                date: new Date(date)
            },
            include: {
                items: {
                    include: {
                        product: true
                    }
                }
            }
        });
    }

    async deleteExpiry(ownerId: string, id: string) {
        const expiry = await prisma.productExpiry.findFirst({
            where: { id, ownerId }
        });

        if (!expiry) {
            throw new Error('Expiry not found');
        }

        return prisma.productExpiry.delete({
            where: { id }
        });
    }

    async assignProduct(productExpiryId: string, productId: string, ownerId: string, quantity?: number) {
        // Verify ownership
        const expiry = await prisma.productExpiry.findFirst({
            where: { id: productExpiryId, ownerId }
        });

        if (!expiry) {
            throw new Error('Expiry group not found');
        }

        const product = await prisma.product.findFirst({
            where: { id: productId, owner_id: ownerId }
        });

        if (!product) {
            throw new Error('Product not found in inventory');
        }

        return prisma.expiryItem.upsert({
            where: {
                productExpiryId_productId: {
                    productExpiryId,
                    productId
                }
            },
            update: {
                quantity: quantity ?? null
            },
            create: {
                productExpiryId,
                productId,
                quantity: quantity ?? null
            },
            include: {
                product: true
            }
        });
    }

    async removeProduct(productExpiryId: string, productId: string, ownerId: string) {
        // Verify ownership
        const expiry = await prisma.productExpiry.findFirst({
            where: { id: productExpiryId, ownerId }
        });

        if (!expiry) {
            throw new Error('Expiry group not found');
        }

        return prisma.expiryItem.delete({
            where: {
                productExpiryId_productId: {
                    productExpiryId,
                    productId
                }
            }
        });
    }
}
