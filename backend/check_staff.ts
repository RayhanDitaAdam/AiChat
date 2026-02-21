
import prisma from './src/common/services/prisma.service.js';

async function checkStaff() {
    const sigma = await prisma.user.findFirst({
        where: { name: { contains: 'sigma', mode: 'insensitive' } }
    });
    console.log('Sigma User:', JSON.stringify(sigma, null, 2));

    if (sigma?.memberOfId) {
        const store = await (prisma as any).owner.findUnique({
            where: { id: sigma.memberOfId }
        });
        console.log('Sigma Store:', JSON.stringify(store, null, 2));
    }
}

checkStaff()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
