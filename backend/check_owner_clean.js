import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function check() {
    try {
        const ownerId = '83f49581-df21-4f24-ba02-40cf5892cbe9';
        const owner = await prisma.owner.findUnique({
            where: { id: ownerId },
            include: { user: { select: { email: true, role: true } } }
        });
        console.log('Owner Info:', owner);

    } catch (err) {
        console.error(err);
    } finally {
        await prisma.$disconnect();
    }
}
check();
