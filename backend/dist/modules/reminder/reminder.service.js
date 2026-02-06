import { prisma } from '../../common/services/prisma.service.js';
export class ReminderService {
    /**
     * Create a new reminder (User role)
     */
    async createReminder(userId, input) {
        const reminder = await prisma.reminder.create({
            data: {
                user_id: userId,
                product: input.product,
                remind_date: new Date(input.remindDate),
            },
        });
        return {
            status: 'success',
            message: 'Reminder created successfully',
            reminder: {
                id: reminder.id,
                product: reminder.product,
                remindDate: reminder.remind_date,
            },
        };
    }
}
//# sourceMappingURL=reminder.service.js.map