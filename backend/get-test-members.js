import prisma from './src/common/services/prisma.service.js';

async function getTestData() {
    const users = await prisma.user.findMany({
        where: { role: 'USER' },
        take: 3,
        select: {
            name: true,
            phone: true,
            qrCode: true,
            points: true
        }
    });
    console.log(JSON.stringify(users, null, 2));
    process.exit(0);
}

getTestData();
