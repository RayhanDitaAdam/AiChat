import { prisma } from '../../common/services/prisma.service.js';

export class SopService {
    async createSop(ownerId: string, title: string, fileUrl: string, fileType: string, content?: string | null) {
        const sop = await (prisma as any).companySOP.create({
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

    async getSopsByOwner(ownerId: string) {
        return (prisma as any).companySOP.findMany({
            where: { ownerId },
            orderBy: { createdAt: 'desc' }
        });
    }

    async getSopById(id: string, ownerId: string) {
        return (prisma as any).companySOP.findFirst({
            where: { id, ownerId }
        });
    }

    async deleteSop(id: string, ownerId: string) {
        const sop = await (prisma as any).companySOP.findFirst({
            where: { id, ownerId }
        });

        if (!sop) {
            throw new Error('SOP not found or access denied');
        }

        await (prisma as any).companySOP.delete({
            where: { id }
        });

        return sop;
    }

    async updateSopText(id: string, ownerId: string, content: string) {
        const sop = await (prisma as any).companySOP.findFirst({
            where: { id, ownerId }
        });

        if (!sop) {
            throw new Error('SOP not found or access denied');
        }

        return (prisma as any).companySOP.update({
            where: { id },
            data: { content }
        });
    }
}
