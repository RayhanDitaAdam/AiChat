import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
    console.log('--- SYSTEM RESET START ---');

    const tables = [
        'User', 'Owner', 'SystemConfig', 'OwnerConfig', 'Product',
        'ShoppingList', 'ShoppingListItem', 'ChatHistory', 'ChatSession',
        'Rating', 'FacilityTask', 'ProductPromo', 'JobVacancy',
        'JobApplication', 'SubLocation', 'RewardActivity', 'UserPending',
        'Category', 'Transaction', 'TransactionItem', 'PointHistory',
        'POSReward', 'HealthData', 'POSSetting', 'DiscountCode',
        'StaffRole', 'Reminder', 'MissingRequest', 'ContributorRequest',
        'AICache', 'AuditLog', 'StaffActivity'
    ];

    // Truncate all tables with CASCADE to handle foreign keys
    for (const table of tables) {
        try {
            await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${table}" CASCADE;`);
            console.log(`[OK] Truncated ${table}`);
        } catch (e: any) {
            console.log(`[SKIP] ${table}: ${e.message}`);
        }
    }

    // Create the new Admin (SUPER_ADMIN)
    const email = 'akuntiktok1397@gmail.com';
    const rawPassword = 'Asui1234';
    const password = await argon2.hash(rawPassword);

    // Generate Key File for Super Admin Login
    const rawKey = crypto.randomBytes(512).toString('hex');
    const superAdminKeyHash = await argon2.hash(rawKey);

    const user = await prisma.user.create({
        data: {
            email,
            password,
            name: 'System Admin',
            role: 'SUPER_ADMIN',
            superAdminKeyHash,
            isEmailVerified: true,
            customerId: 'CUST-ADMIN-01',
            qrCode: 'CUST-ADMIN-01'
        }
    });

    const keyPath = path.join(process.cwd(), 'key.txt');
    fs.writeFileSync(keyPath, rawKey, 'utf8');

    console.log('\n--- SYSTEM RESET COMPLETE ---');
    console.log('New Admin Created:', user.email);
    console.log('Role: SUPER_ADMIN');
    console.log(`Key file generated at: ${keyPath}`);
    console.log('\nIMPORTANT: COPY THE KEY BELOW FOR LOGIN:');
    console.log('--------------------------------------------------');
    console.log(rawKey);
    console.log('--------------------------------------------------');
}

main()
    .catch(e => {
        console.error('Error during reset:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
