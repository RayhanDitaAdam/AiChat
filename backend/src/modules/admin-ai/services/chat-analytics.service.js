import prisma from '../../../common/services/prisma.service.js';

export class ChatAnalyticsService {
    async getGlobalMetrics(ownerId, daysBack = 7) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - daysBack);

        const totalConversations = await prisma.chatSession.count({
            where: { ownerId, createdAt: { gte: startDate } }
        });

        const resolutionStats = await prisma.chatSession.groupBy({
            by: ['resolution'],
            where: { ownerId, createdAt: { gte: startDate } },
            _count: true
        });

        // Intent distribution
        const intentStats = await prisma.chatHistory.groupBy({
            by: ['status'],
            where: {
                session: { ownerId, createdAt: { gte: startDate } },
                status: { not: null }
            },
            _count: true,
            orderBy: { _count: { status: 'desc' } },
            take: 10
        });

        // Calculate AI Accuracy based on human-assigned tags
        const accuracyStats = await prisma.chatSession.groupBy({
            by: ['aiAccuracyTag'],
            where: { ownerId, aiAccuracyTag: { not: null }, createdAt: { gte: startDate } },
            _count: true
        });

        let good = 0, bad = 0;
        accuracyStats.forEach(stat => {
            if (stat.aiAccuracyTag === 'GOOD') good += stat._count;
            if (stat.aiAccuracyTag === 'BAD_ANSWER' || stat.aiAccuracyTag === 'HALLUCINATION') bad += stat._count;
        });

        const aiAccuracy = (good + bad) > 0 ? (good / (good + bad)) * 100 : 100;

        // Daily Conversations for Chart
        const dailyChatsRaw = await prisma.$queryRaw`
            SELECT DATE_TRUNC('day', "createdAt") as date, COUNT(*) as count
            FROM "ChatSession"
            WHERE "ownerId" = ${ownerId} AND "createdAt" >= ${startDate}
            GROUP BY DATE_TRUNC('day', "createdAt")
            ORDER BY date ASC
        `;

        const dailyConversations = dailyChatsRaw.map(row => ({
            date: row.date.toISOString().split('T')[0],
            count: Number(row.count)
        }));

        return {
            totalConversations,
            resolutionStats: resolutionStats.reduce((acc, curr) => {
                acc[curr.resolution || 'UNKNOWN'] = curr._count;
                return acc;
            }, {}),
            aiAccuracy: parseFloat(aiAccuracy.toFixed(2)),
            topIntents: intentStats.map((stat) => ({ name: stat.status, count: stat._count })),
            dailyConversations
        };
    }

    async getUnresolvedSessions(ownerId, limit = 50, skip = 0) {
        return await prisma.chatSession.findMany({
            where: {
                ownerId,
                resolution: 'UNRESOLVED'
            },
            include: {
                chats: {
                    orderBy: { timestamp: 'asc' },
                    take: 10 // Get context
                }
            },
            orderBy: { createdAt: 'desc' },
            take: limit,
            skip
        });
    }

    async tagSession(sessionId, ownerId, resolution, accuracyTag) {
        return await prisma.chatSession.update({
            where: { id: sessionId, ownerId },
            data: { resolution, aiAccuracyTag: accuracyTag }
        });
    }
}
