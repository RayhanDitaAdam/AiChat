
import prisma from './src/common/services/prisma.service.js';

async function testDistinct() {
    const ownerId = 'e0449386-8bfb-4b3f-be75-6d67bd81a825';
    try {
        const sessions = await prisma.chatHistory.findMany({
            where: { owner_id: ownerId },
            distinct: ['user_id'],
            orderBy: { timestamp: 'desc' },
            take: 10
        });
        console.log('Result count:', sessions.length);
        sessions.forEach(s => {
            console.log(`User: ${s.user_id}, Status: ${s.status}, Time: ${s.timestamp}, Msg: ${s.message}`);
        });
    } catch (e) {
        console.error('Test failed:', e);
    }
}

testDistinct()
    .finally(() => prisma.$disconnect());
