import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function resetSuperAdmin() {
    // Delete all existing SUPER_ADMIN users
    const deleted = await prisma.user.deleteMany({ where: { role: 'SUPER_ADMIN' } });
    console.log(`Deleted ${deleted.count} superadmin user(s)`);

    // Hash the new password
    const hashedPassword = await bcrypt.hash('superadmin', 10);

    // Create new superadmin
    const user = await prisma.user.create({
        data: {
            email: 'superadmin@local.dev',
            password: hashedPassword,
            name: 'superadmin',
            role: 'SUPER_ADMIN',
            isEmailVerified: true,
        }
    });

    console.log(`Created superadmin user: ${user.email} (id: ${user.id})`);
    console.log('Username: superadmin');
    console.log('Password: superadmin');
    await prisma.$disconnect();
}

resetSuperAdmin().catch(e => {
    console.error(e);
    process.exit(1);
});
