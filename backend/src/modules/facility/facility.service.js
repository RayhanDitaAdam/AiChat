 function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }import prisma from '../../common/services/prisma.service.js';

import { EmailService } from '../../common/services/email.service.js';

export class FacilityService {
    async createAssignment(ownerId, input) {
        let targetUsers = [];

        console.log(`📋 Creating assignment with scope: ${input.assignScope}`);

        if (input.assignScope === 'ALL') {
            const staff = await (prisma ).user.findMany({
                where: { memberOfId: ownerId, role: 'STAFF' },
                select: { id: true, email: true, name: true }
            });
            targetUsers = staff;
            console.log(`👥 Found ${staff.length} staff members for ALL scope`);
        } else if (input.assignScope === 'ROLE' && input.targetRole) {
            const staff = await (prisma ).user.findMany({
                where: { memberOfId: ownerId, role: 'STAFF', position: input.targetRole },
                select: { id: true, email: true, name: true }
            });
            targetUsers = staff;
            console.log(`👥 Found ${staff.length} staff members for ROLE: ${input.targetRole}`);
        } else {
            // INDIVIDUAL or fallback
            if (input.assignedToId) {
                const user = await (prisma ).user.findUnique({
                    where: { id: input.assignedToId },
                    select: { id: true, email: true, name: true }
                });
                if (user) targetUsers = [user];
                console.log(`👤 Found individual user: ${_optionalChain([user, 'optionalAccess', _ => _.name]) || 'N/A'}`);
            } else {
                // Open task (no specific assignee)
                targetUsers = [{ id: null , email: null , name: null  }];
                console.log(`📝 Creating open task (no assignee)`);
            }
        }

        const createdTasks = [];
        const owner = await (prisma ).owner.findUnique({
            where: { id: ownerId },
            select: { name: true }
        });

        console.log(`🏢 Owner: ${_optionalChain([owner, 'optionalAccess', _2 => _2.name]) || 'Unknown'}`);

        for (const user of targetUsers) {
            const task = await (prisma ).facilityTask.create({
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
                        ownerName: _optionalChain([owner, 'optionalAccess', _3 => _3.name]) || 'Management',
                        id: task.id
                    });
                    console.log(`✅ Task notification email sent to ${user.email}`);
                } catch (err) {
                    console.error(`❌ Failed to send task notification email to ${user.email}:`, err);
                }
            } else {
                console.log(`⚠️  Skipping email for user: ${user.name || 'N/A'} - Missing email: ${!user.email}, Missing name: ${!user.name}`);
            }
        }

        console.log(`✅ Created ${createdTasks.length} task(s)`);
        return { status: 'success', count: createdTasks.length, data: createdTasks };
    }


    async getTasks(ownerId) {
        const tasks = await (prisma ).facilityTask.findMany({
            where: { ownerId },
            orderBy: { taskDate: 'desc' }
        });
        return { status: 'success', data: tasks };
    }

    async updateReport(taskId, input) {
        const task = await (prisma ).facilityTask.update({
            where: { id: taskId },
            data: {
                report: input.report,
                status: input.status || 'COMPLETED'
            }
        });
        return { status: 'success', data: task };
    }

    async updateTask(taskId, ownerId, input) {
        // Ensure task belongs to owner
        const existing = await (prisma ).facilityTask.findFirst({
            where: { id: taskId, ownerId }
        });

        if (!existing) throw new Error('Task not found or unauthorized');

        const task = await (prisma ).facilityTask.update({
            where: { id: taskId },
            data: {
                location: input.location,
                taskDetail: input.taskDetail,
                taskDate: input.taskDate ? new Date(input.taskDate) : undefined,
                assignedToId: input.assignedToId,
                subLocationId: input.subLocationId,
                status: (input ).status // Allow changing status if provided
            }
        });

        return { status: 'success', data: task };
    }

    async deleteTask(taskId, ownerId) {
        // Ensure task belongs to owner
        const existing = await (prisma ).facilityTask.findFirst({
            where: { id: taskId, ownerId }
        });

        if (!existing) throw new Error('Task not found or unauthorized');

        await (prisma ).facilityTask.delete({
            where: { id: taskId }
        });

        return { status: 'success', message: 'Task deleted successfully' };
    }
}
