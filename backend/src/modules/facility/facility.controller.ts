import { FacilityService } from './facility.service.js';
import type { CreateFacilityTaskInput, UpdateFacilityTaskReportInput } from './facility.schema.js';

const facilityService = new FacilityService();

export class FacilityController {
    async createAssignment(req: any, res: any) {
        try {
            // Owner only check for assignment
            if (req.user.role !== 'OWNER') {
                return res.status(403).json({ status: 'error', message: 'Only owners can assign tasks.' });
            }

            const input: CreateFacilityTaskInput = req.body;
            const result = await facilityService.createAssignment(req.user.ownerId, input);
            res.json(result);
        } catch (error: any) {
            res.status(500).json({ status: 'error', message: error.message });
        }
    }

    async getTasks(req: any, res: any) {
        try {
            let ownerId = req.user.ownerId;

            // For staff or users who are members of a store
            if (req.user.role === 'STAFF' && req.user.memberOfId) {
                ownerId = req.user.memberOfId;
            }

            if (!ownerId) {
                return res.status(400).json({ status: 'error', message: 'User is not associated with any store.' });
            }

            const result = await facilityService.getTasks(ownerId);
            res.json(result);
        } catch (error: any) {
            res.status(500).json({ status: 'error', message: error.message });
        }
    }

    async updateReport(req: any, res: any) {
        try {
            const { id } = req.params;
            const input: UpdateFacilityTaskReportInput = req.body;
            const result = await facilityService.updateReport(id, input);
            res.json(result);
        } catch (error: any) {
            res.status(500).json({ status: 'error', message: error.message });
        }
    }
}
