import prisma from '../../prisma.js';

const DEFAULT_OWNER_ID = 'e0449386-8bfb-4b3f-be75-6d67bd81a825'; // HeartAI Central Store

export const getCategories = async () => {
    return await prisma.category.findMany({
        include: { _count: { select: { products: true } } }
    });
};

export const createCategory = async (name: string) => {
    return await prisma.category.create({ data: { name } });
};

export const getProducts = async (filters: { categoryId?: string, search?: string }) => {
    const { categoryId, search } = filters;
    return await prisma.product.findMany({
        where: {
            AND: [
                categoryId ? { categoryId } : {},
                search ? {
                    OR: [
                        { name: { contains: search, mode: 'insensitive' } },
                        { barcode: { contains: search, mode: 'insensitive' } }
                    ]
                } : {}
            ]
        },
        include: { posCategory: true }
    });
};

export const createProduct = async (data: {
    name: string,
    price: number,
    stock: number,
    barcode?: string,
    categoryId: string,
    owner_id?: string,
    aisle?: string,
    rak?: string,
    category?: string,
    image?: string
}) => {
    return await prisma.product.create({
        data: {
            name: data.name,
            price: Number(data.price),
            stock: Number(data.stock),
            barcode: data.barcode,
            categoryId: data.categoryId,
            owner_id: data.owner_id || DEFAULT_OWNER_ID,
            aisle: data.aisle || 'POS',
            rak: data.rak || 'POS',
            category: data.category || 'General',
            image: data.image
        }
    });
};

export const updateProduct = async (id: string, data: any) => {
    return await prisma.product.update({
        where: { id },
        data: {
            ...data,
            price: data.price ? Number(data.price) : undefined,
            stock: data.stock !== undefined ? Number(data.stock) : undefined
        }
    });
};

export const deleteProduct = async (id: string) => {
    return await prisma.product.delete({ where: { id } });
};
