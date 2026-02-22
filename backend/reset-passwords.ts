import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
    const hashedPassword = await argon2.hash('Password123!');

    await prisma.user.updateMany({
        where: { email: { in: ['agrapiti@gmail.com', 'antigrapiri@gmail.com'] } },
        data: { password: hashedPassword, isEmailVerified: true }
    });

    console.log('Passwords updated to: Password123!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
