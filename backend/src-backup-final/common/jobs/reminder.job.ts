import cron from 'node-cron';
import { prisma } from '../services/prisma.service.js';
import { EmailService } from '../services/email.service.js';

/**
 * Initializes the reminder cron job.
 * Runs every minute to check for pending reminders that are due.
 */
export const initReminderJob = () => {
    // Run every minute
    cron.schedule('* * * * *', async () => {
        const now = new Date();

        try {
            // Find all pending reminders that should have been sent by now
            const pendingReminders = await prisma.reminder.findMany({
                where: {
                    status: 'PENDING',
                    remindAt: {
                        lte: now
                    }
                },
                include: {
                    user: true
                }
            });

            if (pendingReminders.length === 0) return;

            console.log(`[Job] Processing ${pendingReminders.length} due reminders...`);

            for (const reminder of pendingReminders) {
                try {
                    // Send email
                    await EmailService.sendReminderEmail(
                        reminder.user.email,
                        reminder.user.name || 'User',
                        reminder.content
                    );

                    // Mark as completed
                    await prisma.reminder.update({
                        where: { id: reminder.id },
                        data: { status: 'COMPLETED' }
                    });

                    console.log(`[Job] Reminder sent successfully to ${reminder.user.email}`);
                } catch (error) {
                    console.error(`[Job] Failed to process reminder ${reminder.id}:`, error);
                }
            }
        } catch (error) {
            console.error('[Job] Reminder cron job error:', error);
        }
    });

    console.log('[Job] Reminder cron job initialized (runs every minute).');
};
