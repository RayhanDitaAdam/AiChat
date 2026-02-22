import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
    const userCount = await prisma.user.count();
    console.log(`Total users in database: ${userCount}`);

    const email = 'akuntiktok1397@gmail.com';
    const password = 'Asui1234';
    const hashedPassword = await argon2.hash(password);

    const user = await prisma.user.upsert({
        where: { email },
        update: {
            role: 'ADMIN',
            password: hashedPassword,
            isEmailVerified: true
        },
        create: {
            email,
            name: 'Admin',
            password: hashedPassword,
            role: 'ADMIN',
            isEmailVerified: true
        }
    });

    console.log(`User ${email} is now set as ${user.role}.`);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
