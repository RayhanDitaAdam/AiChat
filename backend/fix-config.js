
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log('--- UPDATING SYSTEM CONFIG ---');
    const updated = await prisma.systemConfig.update({
        where: { id: 'global' },
        data: {
            aiModel: 'gemini-3-flash-preview'
        }
    });
    console.log('Success! New config:');
    console.log(JSON.stringify(updated, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
