
import prisma from './src/common/services/prisma.service.js';

async function checkHistory() {
    const ownerId = 'e0449386-8bfb-4b3f-be75-6d67bd81a825';
    const userId = 'f2979b85-974c-41f9-bfea-56528eb8f142';

    const history = await prisma.chatHistory.findMany({
        where: {
            owner_id: ownerId,
            user_id: userId
        },
        orderBy: {
            timestamp: 'desc'
        },
        take: 5
    });

    console.log(JSON.stringify(history, null, 2));
}

console.log("START CHECKING HISTORY");
checkHistory()
    .catch(e => console.error("ERROR:", e))
    .finally(async () => {
        await prisma.$disconnect();
        console.log("END CHECKING HISTORY");
    });
