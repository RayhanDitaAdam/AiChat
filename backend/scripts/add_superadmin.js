import 'dotenv/config';
import { prisma } from '../src/common/services/prisma.service.js';
import { PasswordUtil } from '../src/common/utils/password.util.js';

async function addSuperAdmin() {
    const email = 'akuntiktok1397@gmail.com';
    const password = 'Asui1234';

    try {
        console.log(`Checking if user ${email} exists...`);
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        const hashedPassword = await PasswordUtil.hash(password);

        if (existingUser) {
            console.log(`User ${email} already exists. Updating to SUPER_ADMIN...`);
            await prisma.user.update({
                where: { email },
                data: {
                    role: 'SUPER_ADMIN',
                    password: hashedPassword,
                    isEmailVerified: true,
                    isBlocked: false
                }
            });
            console.log(`User ${email} updated successfully!`);
        } else {
            console.log(`Creating new SUPER_ADMIN user: ${email}...`);
            await prisma.user.create({
                data: {
                    email,
                    password: hashedPassword,
                    name: 'Super Admin',
                    role: 'SUPER_ADMIN',
                    isEmailVerified: true,
                    registrationType: 'SUPER_ADMIN'
                }
            });
            console.log(`User ${email} created successfully!`);
        }
    } catch (error) {
        console.error('Error creating superadmin:', error);
    } finally {
        await prisma.$disconnect();
    }
}

addSuperAdmin();
