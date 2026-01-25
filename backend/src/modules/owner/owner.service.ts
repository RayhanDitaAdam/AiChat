import { prisma } from '../../common/services/prisma.service.js';

export class OwnerService {
    /**
     * Get missing product requests for owner
     */
    async getMissingRequests(ownerId: string) {
        const requests = await prisma.missingRequest.findMany({
            where: { owner_id: ownerId },
            orderBy: { count: 'desc' },
        });

        return {
            status: 'success',
            requests,
        };
    }

    /**
     * Get ratings for owner
     */
    async getRatings(ownerId: string) {
        const ratings = await prisma.rating.findMany({
            where: { owner_id: ownerId },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
            },
            orderBy: { id: 'desc' },
        });

        return {
            status: 'success',
            ratings,
        };
    }

    /**
     * Get chat history for owner
     */
    async getChatHistory(ownerId: string) {
        const chats = await prisma.chatHistory.findMany({
            where: { owner_id: ownerId },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
            },
            orderBy: { timestamp: 'desc' },
        });

        return {
            status: 'success',
            chats,
        };
    }
}
