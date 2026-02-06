import prisma from '../../common/services/prisma.service.js';
import nodemailer from 'nodemailer';
export class FacilityService {
    async createAssignment(ownerId, input) {
        const task = await prisma.facilityTask.create({
            data: {
                ownerId,
                location: input.location,
                taskDetail: input.taskDetail,
                taskDate: new Date(input.taskDate),
                assignedToId: input.assignedToId,
                subLocationId: input.subLocationId,
                status: 'PENDING'
            },
            include: {
                assignedTo: { select: { email: true, name: true } },
                owner: { select: { name: true } }
            }
        });
        // Email Notification
        if (task.assignedTo?.email) {
            try {
                await this.sendNotificationEmail(task.assignedTo.email, {
                    staffName: task.assignedTo.name,
                    taskDetail: task.taskDetail,
                    location: task.location,
                    ownerName: task.owner.name,
                    id: task.id
                });
            }
            catch (err) {
                console.error('Failed to send task notification email:', err);
            }
        }
        return { status: 'success', data: task };
    }
    async sendNotificationEmail(to, data) {
        // Simple transporter for demo/dev. In prod use real SMTP
        const transporter = nodemailer.createTransport({
            host: "smtp.ethereal.email",
            port: 587,
            secure: false,
            auth: {
                user: process.env.EMAIL_USER || 'ethereal_user',
                pass: process.env.EMAIL_PASS || 'ethereal_pass',
            },
        });
        await transporter.sendMail({
            from: '"AiChat Management" <noreply@aichat.com>',
            to,
            subject: `New Task Assigned: ${data.location}`,
            text: `Hi ${data.staffName},\n\nYou have been assigned a new task at ${data.ownerName}.\n\nLocation: ${data.location}\nDetail: ${data.taskDetail}\nTask ID: ${data.id}\n\nPlease report once completed.`,
            html: `<h3>Hi ${data.staffName}</h3>
                   <p>You have been assigned a new task at <b>${data.ownerName}</b>.</p>
                   <p><b>Location:</b> ${data.location}</p>
                   <p><b>Detail:</b> ${data.taskDetail}</p>
                   <p><b>Task ID:</b> <code>${data.id}</code></p>
                   <p>Please report once completed bre!</p>`
        });
    }
    async getTasks(ownerId) {
        const tasks = await prisma.facilityTask.findMany({
            where: { ownerId },
            orderBy: { taskDate: 'desc' }
        });
        return { status: 'success', data: tasks };
    }
    async updateReport(taskId, input) {
        const task = await prisma.facilityTask.update({
            where: { id: taskId },
            data: {
                report: input.report,
                status: input.status || 'COMPLETED'
            }
        });
        return { status: 'success', data: task };
    }
}
//# sourceMappingURL=facility.service.js.map