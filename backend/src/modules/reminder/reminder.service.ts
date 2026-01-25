import { prisma } from '../../common/services/prisma.service.js';
import type { CreateReminderInput } from './reminder.schema.js';

export class ReminderService {
    /**
     * Create a new reminder (User role)
     */
    async createReminder(userId: string, input: CreateReminderInput) {
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
