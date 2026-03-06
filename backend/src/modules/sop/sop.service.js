import { prisma } from '../../common/services/prisma.service.js';

export class SopService {
    async createSop(ownerId, title, fileUrl, fileType, content) {
        const sop = await (prisma ).companySOP.create({
            data: {
                ownerId,
                title,
                fileUrl,
                fileType,
                content
            }
        });
        return sop;
    }

    async getSopsByOwner(ownerId) {
        return (prisma ).companySOP.findMany({
            where: { ownerId },
            orderBy: { createdAt: 'desc' }
        });
    }

    async getSopById(id, ownerId) {
        return (prisma ).companySOP.findFirst({
            where: { id, ownerId }
        });
    }

    async deleteSop(id, ownerId) {
        const sop = await (prisma ).companySOP.findFirst({
            where: { id, ownerId }
        });

        if (!sop) {
            throw new Error('SOP not found or access denied');
        }

        await (prisma ).companySOP.delete({
            where: { id }
        });

        return sop;
    }

    async updateSopText(id, ownerId, content) {
        const sop = await (prisma ).companySOP.findFirst({
            where: { id, ownerId }
        });

        if (!sop) {
            throw new Error('SOP not found or access denied');
        }

        return (prisma ).companySOP.update({
            where: { id },
            data: { content }
        });
    }
}
