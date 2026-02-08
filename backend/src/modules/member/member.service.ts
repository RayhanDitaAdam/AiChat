import prisma from '../../common/services/prisma.service.js';

export const getMembers = async (search?: string) => {
    return await prisma.user.findMany({
        where: {
            AND: [
                {
                    OR: [
                        { role: 'USER' },
                        { registrationType: 'MEMBER' }
                    ]
                },
                ...(search ? [{
                    OR: [
                        { name: { contains: search, mode: 'insensitive' as any } },
                        { phone: { contains: search, mode: 'insensitive' as any } },
                        { email: { contains: search, mode: 'insensitive' as any } },
                        { username: { contains: search, mode: 'insensitive' as any } },
                        { customerId: { contains: search, mode: 'insensitive' as any } }
                    ]
                }] : [])
            ]
        },
        select: {
            id: true,
            username: true,
            name: true,
            phone: true,
            email: true,
            points: true,
            dob: true,
            createdAt: true
        }
    });
};

export const getMemberDetail = async (id: string) => {
    return await prisma.user.findFirst({
        where: { id },
        include: {
            posPointHistory: { orderBy: { createdAt: 'desc' }, take: 10 },
            myTransactions: {
                orderBy: { createdAt: 'desc' },
                take: 5,
                include: { items: { include: { product: true } } }
            }
        }
    });
};
