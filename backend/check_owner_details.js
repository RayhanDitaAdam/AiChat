import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function check() {
    try {
        const ownerId = '83f49581-df21-4f24-ba02-40cf5892cbe9';
        const owner = await prisma.owner.findUnique({
            where: { id: ownerId },
            include: { user: true }
        });
        console.log('Owner details:', JSON.stringify(owner, null, 2));

    } catch (err) {
        console.error(err);
    } finally {
        await prisma.$disconnect();
    }
}
check();
