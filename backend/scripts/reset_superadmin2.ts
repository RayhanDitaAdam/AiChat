import { PrismaClient } from '@prisma/client';
import argon2 from 'argon2';

const prisma = new PrismaClient();

async function resetSuperAdmin() {
    // Delete all existing SUPER_ADMIN users
    const deleted = await prisma.user.deleteMany({ where: { role: 'SUPER_ADMIN' } });
    console.log(`Deleted ${deleted.count} superadmin user(s)`);

    // Hash with argon2 (same as PasswordUtil)
    const hashedPassword = await argon2.hash('superadmin');
    const hashedKey = await argon2.hash('superadmin-key-2026');

    const user = await prisma.user.create({
        data: {
            email: 'superadmin@local.dev',
            password: hashedPassword,
            name: 'superadmin',
            role: 'SUPER_ADMIN',
            isEmailVerified: true,
            superAdminKeyHash: hashedKey,
        } as any
    });

    console.log(`Created superadmin: ${user.email}`);
    console.log('Login email: superadmin@local.dev');
    console.log('Password: superadmin');
    console.log('Key file content: superadmin-key-2026  (file saved at ./superadmin.key.txt)');

    const { writeFileSync } = await import('fs');
    writeFileSync('./superadmin.key.txt', 'superadmin-key-2026', 'utf8');

    await prisma.$disconnect();
}

resetSuperAdmin().catch(e => {
    console.error(e);
    process.exit(1);
});
