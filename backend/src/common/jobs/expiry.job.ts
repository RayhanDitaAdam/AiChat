import cron from 'node-cron';
import { prisma } from '../services/prisma.service.js';
import { EmailService } from '../services/email.service.js';

/**
 * Initializes the product expiry check job.
 * Runs every 30 minutes to check for expiring products.
 */
export const initExpiryJob = () => {
    // Run once on startup to catch up
    checkProductsExpiry();

    // Run every 30 minutes to catch products added throughout the day
    cron.schedule('*/30 * * * *', async () => {
        await checkProductsExpiry();
    });

    console.log('[ExpiryJob] Product expiry job initialized (runs every 30 minutes).');
};

async function checkProductsExpiry() {
    const now = new Date();
    const sevenDaysLater = new Date(now);
    sevenDaysLater.setDate(now.getDate() + 7);

    try {
        console.log('[ExpiryJob] Running state-based product expiry check...');

        // 1. Find products EXPIRED (expiryDate <= now) but NOT YET NOTIFIED
        const expiredToNotify = await prisma.product.findMany({
            where: {
                expiryDate: { lte: now },
                expiryNotified: false
            },
            include: { owner: { include: { user: true } } }
        });

        // 2. Find products EXPIRING SOON (now < expiryDate <= 7 days) but NOT YET WARNED
        const expiringSoonToNotify = await prisma.product.findMany({
            where: {
                expiryDate: {
                    gt: now,
                    lte: sevenDaysLater
                },
                warningNotified: false
            },
            include: { owner: { include: { user: true } } }
        });

        // Process Expired
        for (const p of expiredToNotify) {
            if (p.owner.user?.email) {
                console.log(`[ExpiryJob] Sending EXPIRED notification for ${p.name} to ${p.owner.user.email}`);
                await EmailService.sendExpiryNotification(
                    p.owner.user.email,
                    p.owner.user.name || 'Owner',
                    {
                        name: p.name,
                        expiryDate: p.expiryDate!.toLocaleDateString(),
                        status: 'EXPIRED'
                    }
                );
                // Mark as notified
                await prisma.product.update({
                    where: { id: p.id },
                    data: { expiryNotified: true, warningNotified: true }
                });
            }
        }

        // Process Expiring Soon
        for (const p of expiringSoonToNotify) {
            if (p.owner.user?.email) {
                console.log(`[ExpiryJob] Sending EXPIRING_SOON notification for ${p.name} to ${p.owner.user.email}`);
                await EmailService.sendExpiryNotification(
                    p.owner.user.email,
                    p.owner.user.name || 'Owner',
                    {
                        name: p.name,
                        expiryDate: p.expiryDate!.toLocaleDateString(),
                        status: 'EXPIRING_SOON'
                    }
                );
                // Mark warning as notified
                await prisma.product.update({
                    where: { id: p.id },
                    data: { warningNotified: true }
                });
            }
        }

        if (expiredToNotify.length > 0 || expiringSoonToNotify.length > 0) {
            console.log(`[ExpiryJob] Notified ${expiredToNotify.length} expired and ${expiringSoonToNotify.length} expiring soon products.`);
        }
    } catch (error) {
        console.error('[ExpiryJob] Error:', error);
    }
}
