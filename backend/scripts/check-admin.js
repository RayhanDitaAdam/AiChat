import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('--- Super Admin Status Check ---');
    const admins = await prisma.user.findMany({
        where: { role: 'SUPER_ADMIN' },
        select: { id: true, email: true, superAdminKeyHash: true }
    });

    if (admins.length === 0) {
        console.log('No Super Admin found in database.');
    } else {
        admins.forEach(admin => {
            console.log(`Email: ${admin.email}`);
            console.log(`ID: ${admin.id}`);
            console.log(`Has Security Key Hash: ${!!admin.superAdminKeyHash}`);
            console.log('---');
        });
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
