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

    /**
     * Get owner details by domain (Public)
     */
    async getOwnerByDomain(domain: string) {
        const owner = await prisma.owner.findUnique({
            where: { domain },
            select: {
                id: true,
                name: true,
                domain: true,
            },
        });

        if (!owner) {
            throw new Error('Owner not found');
        }

        return {
            status: 'success',
            owner,
        };
    }

    /**
     * Get active live support sessions for owner
     */
    async getLiveSupportSessions(ownerId: string) {
        // Find users who have requested staff in the last 1 hour
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

        const rawSessions = await prisma.chatHistory.findMany({
            where: {
                owner_id: ownerId,
                timestamp: { gte: oneHourAgo }
            },
            include: {
                user: {
                    select: { id: true, name: true, email: true }
                }
            },
            orderBy: { timestamp: 'desc' }
        });

        // Deduplicate by user_id in JS - Keep the LATEST record for each user
        const uniqueSessionsMap = new Map();
        for (const session of rawSessions) {
            if (!uniqueSessionsMap.has(session.user_id)) {
                uniqueSessionsMap.set(session.user_id, session);
            }
        }

        const sessions = Array.from(uniqueSessionsMap.values());

        return {
            status: 'success',
            sessions
        };
    }

    /**
     * Respond to a user in live chat
     */
    async respondToChat(ownerId: string, userId: string, message: string) {
        const chat = await prisma.chatHistory.create({
            data: {
                owner_id: ownerId,
                user_id: userId,
                message: message,
                role: 'staff',
                // @ts-ignore
                status: 'STAFF_REPLY'
            }
        });

        return {
            status: 'success',
            chat
        };
    }

    /**
     * Get chat history for a specific user in live support
     */
    async getLiveChatHistory(ownerId: string, userId: string, since?: string) {
        let dateLimit: Date;

        if (since && since.trim() !== '') {
            dateLimit = new Date(since);
            if (isNaN(dateLimit.getTime())) {
                dateLimit = new Date(Date.now() - 24 * 60 * 60 * 1000);
            }
        } else {
            dateLimit = new Date(Date.now() - 24 * 60 * 60 * 1000);
        }

        const chats = await prisma.chatHistory.findMany({
            where: {
                owner_id: ownerId,
                user_id: userId,
                timestamp: { gt: dateLimit }
            },
            orderBy: { timestamp: 'asc' }
        });

        return {
            status: 'success',
            chats
        };
    }
}
