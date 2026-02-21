import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkAdminAccounts() {
    const emails = ['akuntiktok1397@gmail.com', 'rayhan.dita45@smk.belajar.id'];

    for (const email of emails) {
        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (user) {
            console.log(`User ${email} exists with role: ${user.role}`);
        } else {
            console.log(`User ${email} does not exist.`);
        }
    }
}

checkAdminAccounts()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
