import { prisma } from './src/common/services/prisma.service.js';

async function verifyFeatures() {
    console.log('--- VERIFYING AI REMINDER & MISSING REQUEST ---');

    // 1. Get a test user and owner
    const user = await prisma.user.findFirst({ where: { email: 'user@example.com' } });
    const owner = await prisma.owner.findFirst({ where: { domain: 'heartai-store' } });

    if (!user || !owner) {
        console.error('User or Owner not found. Run seed first.');
        return;
    }

    console.log(`Test User: ${user.id} (${user.email})`);
    console.log(`Test Owner: ${owner.id} (${owner.domain})`);

    // 2. Test Reminder Creation
    console.log('\nTesting Reminder Creation...');
    const remindAt = new Date();
    remindAt.setDate(remindAt.getDate() + 1);

    const newReminder = await prisma.reminder.create({
        data: {
            userId: user.id,
            ownerId: owner.id,
            content: 'Belanja Sayur untuk Besok',
            remindAt: remindAt,
            status: 'PENDING'
        }
    });
    console.log('Reminder Created:', newReminder);

    // 3. Test Missing Request Logging
    console.log('\nTesting Missing Request Logging...');
    const query = 'baju astronot anak';

    const mReq = await prisma.missingRequest.upsert({
        where: {
            ownerId_query: {
                ownerId: owner.id,
                query: query
            }
        },
        update: {
            count: { increment: 1 }
        },
        create: {
            ownerId: owner.id,
            query: query,
            count: 1
        }
    });
    console.log('Missing Request Record:', mReq);

    // 4. Verification Check
    const reminderCount = await prisma.reminder.count({ where: { userId: user.id } });
    const missingReqCount = await prisma.missingRequest.count({ where: { ownerId: owner.id } });

    console.log(`\nFinal Stats:`);
    console.log(`- Reminders for user: ${reminderCount}`);
    console.log(`- Missing requests for store: ${missingReqCount}`);

    if (reminderCount > 0 && missingReqCount > 0) {
        console.log('\n✅ VERIFICATION SUCCESSFUL: Database models are working correctly.');
    } else {
        console.log('\n❌ VERIFICATION FAILED: Data not found in database.');
    }

    console.log('\n--- VERIFICATION COMPLETED ---');
}

verifyFeatures().catch(console.error).finally(() => prisma.$disconnect());
