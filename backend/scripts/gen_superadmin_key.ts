import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { writeFileSync } from 'fs';

const prisma = new PrismaClient();

async function generateKeyFile() {
    const user = await prisma.user.findFirst({ where: { role: 'SUPER_ADMIN', email: 'superadmin@local.dev' } });
    if (!user) {
        console.error('Superadmin user not found! Run reset_superadmin.ts first.');
        process.exit(1);
    }

    // Generate a simple key
    const keyContent = 'superadmin-key-2026';
    const hashed = await bcrypt.hash(keyContent, 10);

    await prisma.user.update({
        where: { id: user.id },
        data: { superAdminKeyHash: hashed } as any
    });

    // Save key file
    writeFileSync('./superadmin.key.txt', keyContent, 'utf8');

    console.log('Key file generated: superadmin.key.txt');
    console.log(`Key content: ${keyContent}`);
    console.log('Use this file to login as superadmin after entering email/password.');
    await prisma.$disconnect();
}

generateKeyFile().catch(e => {
    console.error(e);
    process.exit(1);
});
