export declare class ReminderService {
    /**
     * Create a new reminder (User role)
     */
    createReminder(userId: string, input: any): Promise<{
        status: string;
        message: string;
        reminder: {
            id: string;
            product: string;
            remindDate: Date;
        };
    }>;
}
//# sourceMappingURL=reminder.service.d.ts.map