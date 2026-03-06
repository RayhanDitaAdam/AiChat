import prisma from '../common/services/prisma.service.js';
import { PasswordUtil } from '../common/utils/password.util.js';
import { Role } from '../common/types/auth.types.js';

async function createAdmin() {
    const email = 'admin@admin.com';
    const password = 'PasswordAdmin123!';
    const name = 'System Admin';

    try {
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            console.log('Admin user already exists');
            return;
        }

        const hashedPassword = await PasswordUtil.hash(password);

        const admin = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                role: Role.ADMIN
            }
        });

        console.log('Admin user created successfully:');
        console.log(`Email: ${email}`);
        console.log(`Password: ${password}`);
    } catch (error) {
        console.error('Error creating admin user:', error);
    } finally {
        await prisma.$disconnect();
    }
}

createAdmin();
