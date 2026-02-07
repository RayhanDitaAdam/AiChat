import prisma from '../../prisma.js';

export const getSettings = async () => {
    return await prisma.setting.findUnique({
        where: { id: 'global' }
    });
};

export const updateSettings = async (data: any) => {
    return await prisma.setting.update({
        where: { id: 'global' },
        data
    });
};
