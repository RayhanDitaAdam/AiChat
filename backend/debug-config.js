
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const config = await prisma.systemConfig.findUnique({ where: { id: 'global' } });
    console.log('--- SYSTEM CONFIG ---');
    console.log(JSON.stringify(config, null, 2));

    // Also check if there's any active call for a specific user if provided
    const userId = process.argv[2];
    if (userId) {
        const activeCall = await prisma.chatHistory.findFirst({
            where: {
                user_id: userId,
                status: { in: ['CALL_PENDING', 'CALL_ACCEPTED'] }
            }
        });
        console.log('--- ACTIVE CALL ---');
        console.log(JSON.stringify(activeCall, null, 2));
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
