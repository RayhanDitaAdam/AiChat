
import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
    const email = 'superadmin@example.com';
    const password = await argon2.hash('Password123!');

    // Generate a very long secure key file string
    const rawKey = crypto.randomBytes(512).toString('hex');
    const superAdminKeyHash = await argon2.hash(rawKey);

    const user = await prisma.user.upsert({
        where: { email },
        update: {
            role: 'SUPER_ADMIN',
            password,
            superAdminKeyHash,
            isEmailVerified: true
        },
        create: {
            email,
            password,
            name: 'Super Admin',
            role: 'SUPER_ADMIN',
            superAdminKeyHash,
            isEmailVerified: true,
            customerId: 'CUST-SUPER01',
            qrCode: 'CUST-SUPER01'
        }
    });

    const keyPath = path.join(process.cwd(), 'key.txt');
    fs.writeFileSync(keyPath, rawKey, 'utf8');

    console.log('Super Admin created:', user.email);
    console.log(`Key file generated at: ${keyPath}`);
    console.log('KEEP THIS FILE SAFE - IT IS REQUIRED FOR SUPER ADMIN LOGIN');
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
