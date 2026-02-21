
import prisma from './src/common/services/prisma.service.js';

async function listUsers() {
    const users = await prisma.user.findMany({
        select: { email: true, name: true, role: true }
    });
    console.log('All Users:', JSON.stringify(users, null, 2));
}

listUsers()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
