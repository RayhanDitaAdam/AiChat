import prisma from '../../common/services/prisma.service.js';
import { EmailService } from '../../common/services/email.service.js';
export class FacilityService {
    async createAssignment(ownerId, input) {
        let targetUsers = [];
        console.log(`📋 Creating assignment with scope: ${input.assignScope}`);
        if (input.assignScope === 'ALL') {
            const staff = await prisma.user.findMany({
                where: { memberOfId: ownerId, role: 'STAFF' },
                select: { id: true, email: true, name: true }
            });
            targetUsers = staff;
            console.log(`👥 Found ${staff.length} staff members for ALL scope`);
        }
        else if (input.assignScope === 'ROLE' && input.targetRole) {
            const staff = await prisma.user.findMany({
                where: { memberOfId: ownerId, role: 'STAFF', position: input.targetRole },
                select: { id: true, email: true, name: true }
            });
            targetUsers = staff;
            console.log(`👥 Found ${staff.length} staff members for ROLE: ${input.targetRole}`);
        }
        else {
            // INDIVIDUAL or fallback
            if (input.assignedToId) {
                const user = await prisma.user.findUnique({
                    where: { id: input.assignedToId },
                    select: { id: true, email: true, name: true }
                });
                if (user)
                    targetUsers = [user];
                console.log(`👤 Found individual user: ${user?.name || 'N/A'}`);
            }
            else {
                // Open task (no specific assignee)
                targetUsers = [{ id: null, email: null, name: null }];
                console.log(`📝 Creating open task (no assignee)`);
            }
        }
        const createdTasks = [];
        const owner = await prisma.owner.findUnique({
            where: { id: ownerId },
            select: { name: true }
        });
        console.log(`🏢 Owner: ${owner?.name || 'Unknown'}`);
        for (const user of targetUsers) {
            const task = await prisma.facilityTask.create({
                data: {
                    ownerId,
                    location: input.location,
                    taskDetail: input.taskDetail,
                    taskDate: new Date(input.taskDate),
                    assignedToId: user.id,
                    subLocationId: input.subLocationId,
                    status: 'PENDING'
                }
            });
            createdTasks.push(task);
            // Email Notification - send to each staff member
            if (user.email && user.name) {
                console.log(`📧 Attempting to send email to: ${user.name} (${user.email})`);
                try {
                    await EmailService.sendTaskAssignmentEmail(user.email, {
                        staffName: user.name,
                        taskDetail: task.taskDetail,
                        location: task.location,
                        ownerName: owner?.name || 'Management',
                        id: task.id
                    });
                    console.log(`✅ Task notification email sent to ${user.email}`);
                }
                catch (err) {
                    console.error(`❌ Failed to send task notification email to ${user.email}:`, err);
                }
            }
            else {
                console.log(`⚠️  Skipping email for user: ${user.name || 'N/A'} - Missing email: ${!user.email}, Missing name: ${!user.name}`);
            }
        }
        console.log(`✅ Created ${createdTasks.length} task(s)`);
        return { status: 'success', count: createdTasks.length, data: createdTasks };
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