import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';
import crypto from 'crypto';
import fs from 'fs';

const prisma = new PrismaClient();

async function createSuperAdmin() {
    const email = 'Han.heart.ai@gmail.com';
    const password = '19871989@#$ASD';
    const name = 'Han Super Admin';

    // 1. Generate Super Admin Key
    const keyContent = crypto.randomBytes(32).toString('hex');
    const keyHash = await argon2.hash(keyContent);

    // 2. Hash Password
    const passwordHash = await argon2.hash(password);

    // 3. Generate Customer ID (CUST-XXXXXXX)
    const customerId = `CUST-${Math.floor(1000000 + Math.random() * 9000000)}`;

    try {
        const user = await prisma.user.create({
            data: {
                email,
                password: passwordHash,
                name,
                role: 'SUPER_ADMIN',
                isEmailVerified: true,
                customerId,
                qrCode: customerId,
                superAdminKeyHash: keyHash,
                avatarVariant: 'beam'
            }
        });

        console.log('\n✅ Super Admin created successfully!');
        console.log('-----------------------------------');
        console.log(`Email: ${email}`);
        console.log(`Password: ${password}`);
        console.log(`Customer ID: ${customerId}`);
        console.log('-----------------------------------');
        console.log('\n🔑 IMPORTANT: This is your Super Admin Key File content.');
        console.log('Save the following string into a file (e.g., keyfile.txt) to login:');
        console.log('\n' + keyContent + '\n');

        // Also save it to a file for convenience
        fs.writeFileSync('superadmin_key_han.txt', keyContent);
        console.log(`\nKey file also saved as: superadmin_key_han.txt`);

    } catch (error) {
        console.error('Error creating super admin:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

createSuperAdmin();
