import type { CreateFacilityTaskInput, UpdateFacilityTaskReportInput } from './facility.schema.js';
export declare class FacilityService {
    createAssignment(ownerId: string, input: CreateFacilityTaskInput): Promise<{
        status: string;
        data: any;
    }>;
    private sendNotificationEmail;
    getTasks(ownerId: string): Promise<{
        status: string;
        data: any;
    }>;
    updateReport(taskId: string, input: UpdateFacilityTaskReportInput): Promise<{
        status: string;
        data: any;
    }>;
}
//# sourceMappingURL=facility.service.d.ts.map