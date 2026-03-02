import type { CreateFacilityTaskInput, UpdateFacilityTaskReportInput, UpdateFacilityTaskInput } from './facility.schema.js';
export declare class FacilityService {
    createAssignment(ownerId: string, input: CreateFacilityTaskInput): Promise<{
        status: string;
        count: number;
        data: any[];
    }>;
    getTasks(ownerId: string): Promise<{
        status: string;
        data: any;
    }>;
    updateReport(taskId: string, input: UpdateFacilityTaskReportInput): Promise<{
        status: string;
        data: any;
    }>;
    updateTask(taskId: string, ownerId: string, input: UpdateFacilityTaskInput): Promise<{
        status: string;
        data: any;
    }>;
    deleteTask(taskId: string, ownerId: string): Promise<{
        status: string;
        message: string;
    }>;
}
//# sourceMappingURL=facility.service.d.ts.map