import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function check() {
    try {
        const admins = await prisma.user.findMany({ where: { role: 'ADMIN' } });
        console.log('Admins found:', admins.length);
        admins.forEach(a => console.log(a.id, a.email, a.role));

        const allUsers = await prisma.user.findMany({
            take: 5,
            select: { id: true, email: true, role: true }
        });
        console.log('Sample users:', JSON.stringify(allUsers, null, 2));

    } catch (err) {
        console.error(err);
    } finally {
        await prisma.$disconnect();
    }
}
check();
