import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const products = await prisma.product.findMany({
        where: {
            name: {
                contains: 'Kol',
                mode: 'insensitive'
            }
        },
        include: {
            owner: true
        }
    });

    console.log('Found products matching "Kol":');
    products.forEach(p => {
        console.log(`- Product: ${p.name}, ID: ${p.id}, OwnerID: ${p.owner_id}, OwnerName: ${p.owner.name}`);
    });
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
