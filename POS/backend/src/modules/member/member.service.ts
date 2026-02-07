import prisma from '../../prisma.js';

export const getMembers = async (search?: string) => {
    return await prisma.user.findMany({
        where: {
            // In AiChat context, members might be regular USERS or specifically marked
            OR: [
                { role: 'USER' },
                { registrationType: 'MEMBER' }
            ],
            ...(search ? {
                OR: [
                    { name: { contains: search, mode: 'insensitive' } },
                    { phone: { contains: search, mode: 'insensitive' } },
                    { email: { contains: search, mode: 'insensitive' } }
                ]
            } : {})
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
            myTransactions: { orderBy: { createdAt: 'desc' }, take: 5 }
        }
    });
};
