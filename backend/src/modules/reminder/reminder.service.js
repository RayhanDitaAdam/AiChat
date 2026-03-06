import { prisma } from '../../common/services/prisma.service.js';


export class ReminderService {
    /**
     * Create a new reminder (User role)
     */
    async createReminder(userId, input) {
        const reminder = await prisma.reminder.create({
            data: {
                userId,
                ownerId: input.ownerId,
                content: input.product,
                remindAt: new Date(input.remindDate),
            },
        });

        return {
            status: 'success',
            message: 'Reminder created successfully',
            reminder: {
                id: reminder.id,
                product: reminder.content,
                remindDate: reminder.remindAt,
            },
        };
    }
}
