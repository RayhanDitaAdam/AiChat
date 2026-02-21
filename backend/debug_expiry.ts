import { prisma } from './src/common/services/prisma.service.js';

async function check() {
    const now = new Date();
    const products = await prisma.product.findMany({
        where: {
            expiryDate: { lte: now }
        },
        include: {
            owner: {
                include: {
                    user: true
                }
            }
        }
    });

    console.log('--- Expired Products Check ---');
    console.log('Now:', now.toISOString());
    console.log('Count:', products.length);

    products.forEach(p => {
        console.log(`Product: ${p.name}`);
        console.log(`  Expiry: ${p.expiryDate?.toISOString()}`);
        console.log(`  Notified: ${p.expiryNotified}`);
        console.log(`  Owner Email: ${p.owner.user?.email}`);
        console.log(`  Owner Name: ${p.owner.user?.name}`);
    });
}

check().catch(console.error);
