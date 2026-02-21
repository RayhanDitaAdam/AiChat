import { prisma } from './src/common/services/prisma.service.js';

async function verifyEmailReminder() {
    console.log('--- VERIFYING EMAIL REMINDER JOB ---');

    const user = await prisma.user.findFirst({ where: { email: 'user@example.com' } });
    const owner = await prisma.owner.findFirst({ where: { domain: 'heartai-store' } });

    if (!user || !owner) {
        console.error('User or Owner not found. Run seed first.');
        return;
    }

    console.log(`Test User: ${user.id} (${user.email})`);

    // Create a reminder in the past (1 minute ago)
    const pastDate = new Date(Date.now() - 60000);

    console.log('Creating a past-due reminder...');
    const reminder = await prisma.reminder.create({
        data: {
            userId: user.id,
            ownerId: owner.id,
            content: 'TEST EMAIL REMINDER - JANGAN LUPA BELI SIGMA',
            remindAt: pastDate,
            status: 'PENDING'
        }
    });

    console.log('Reminder Created:', reminder.id);
    console.log('Wait for the cron job to pick it up (runs every minute)...');
    console.log('Check the backend terminal for logs.');
}

verifyEmailReminder()
    .catch(err => console.error(err))
    .finally(() => process.exit());
