import { PrismaClient } from '@prisma/client';
import { PasswordUtil } from '../src/common/utils/password.util.js';
import crypto from 'crypto';

const prisma = new PrismaClient();

async function main() {
    const email = 'akuntiktok1397@gmail.com'; // Based on previous conversations

    console.log(`Setting initial Super Admin key for: ${email}`);

    const user = await prisma.user.findUnique({
        where: { email },
    });

    if (!user) {
        console.error('User not found!');
        process.exit(1);
    }

    if (user.role !== 'SUPER_ADMIN') {
        console.error('User is not a Super Admin!');
        process.exit(1);
    }

    // Generate a random 64-character hex key
    const secureKey = crypto.randomBytes(32).toString('hex');
    const hashedPassword = await PasswordUtil.hash(secureKey);

    await prisma.user.update({
        where: { id: user.id },
        data: { superAdminKeyHash: hashedPassword }
    });

    console.log('--------------------------------------------------');
    console.log('SUCCESS: Super Admin key updated in database.');
    console.log('--------------------------------------------------');
    console.log('YOUR SECURE KEY (Copy this and save as key.txt):');
    console.log('\x1b[36m%s\x1b[0m', secureKey);
    console.log('--------------------------------------------------');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
