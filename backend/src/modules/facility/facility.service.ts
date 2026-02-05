import prisma from '../../common/services/prisma.service.js';
import type { CreateFacilityTaskInput, UpdateFacilityTaskReportInput } from './facility.schema.js';

export class FacilityService {
    async createAssignment(ownerId: string, input: CreateFacilityTaskInput) {
        const task = await (prisma as any).facilityTask.create({
            data: {
                ownerId,
                location: input.location,
                taskDetail: input.taskDetail,
                taskDate: new Date(input.taskDate),
                assignedToId: input.assignedToId,
                status: 'PENDING'
            }
        });
        return { status: 'success', data: task };
    }

    async getTasks(ownerId: string) {
        const tasks = await (prisma as any).facilityTask.findMany({
            where: { ownerId },
            orderBy: { taskDate: 'desc' }
        });
        return { status: 'success', data: tasks };
    }

    async updateReport(taskId: string, input: UpdateFacilityTaskReportInput) {
        const task = await (prisma as any).facilityTask.update({
            where: { id: taskId },
            data: {
                report: input.report,
                status: input.status || 'COMPLETED'
            }
        });
        return { status: 'success', data: task };
    }
}
