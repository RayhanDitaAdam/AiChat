import prisma from '../../common/services/prisma.service.js';

export const getSettings = async () => {
    return await prisma.pOSSetting.findUnique({
        where: { id: 'global' }
    });
};

export const updateSettings = async (data: any) => {
    return await prisma.pOSSetting.upsert({
        where: { id: 'global' },
        update: data,
        create: {
            id: 'global',
            ...data
        }
    });
};
