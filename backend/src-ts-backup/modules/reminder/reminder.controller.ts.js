import { ReminderService } from "./reminder.service.js";

const reminderService = new ReminderService();

export class ReminderController {
  /**
   * POST /api/reminder
   * Create a new reminder (User role only)
   */
  async createReminder(req, res) {
    try {
      if (!req.user) {
        return res.status(401).json({
          status: "error",
          message: "Authentication required",
        });
      }

      const result = await reminderService.createReminder(
        req.user.id,
        req.body,
      );
      return res.json(result);
    } catch (error) {
      console.error("Create Reminder Controller Error:", error);
      return res.status(400).json({
        status: "error",
        message:
          error instanceof Error ? error.message : "Failed to create reminder",
      });
    }
  }
}
