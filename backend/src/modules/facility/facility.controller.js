import { FacilityService } from './facility.service.js';


const facilityService = new FacilityService();

export class FacilityController {
    async createAssignment(req, res) {
        try {
            // Owner or Admin check for assignment
            if (req.user.role !== 'OWNER' && req.user.role !== 'ADMIN') {
                return res.status(403).json({ status: 'error', message: 'Unauthorized. Only owners and admins can assign tasks.' });
            }

            const ownerId = req.user.ownerId;
            if (!ownerId) {
                return res.status(400).json({ status: 'error', message: 'Missing store association (ownerId).' });
            }

            const input = req.body;
            const result = await facilityService.createAssignment(ownerId, input);
            res.json(result);
        } catch (error) {
            res.status(500).json({ status: 'error', message: error.message });
        }
    }

    async getTasks(req, res) {
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
        } catch (error) {
            res.status(500).json({ status: 'error', message: error.message });
        }
    }

    async updateReport(req, res) {
        try {
            const { id } = req.params;
            const input = req.body;
            const result = await facilityService.updateReport(id, input);
            res.json(result);
        } catch (error) {
            res.status(500).json({ status: 'error', message: error.message });
        }
    }

    async updateTask(req, res) {
        try {
            if (req.user.role !== 'OWNER' && req.user.role !== 'ADMIN') {
                return res.status(403).json({ status: 'error', message: 'Unauthorized. Only owners and admins can edit tasks.' });
            }

            const ownerId = req.user.ownerId;
            if (!ownerId) {
                return res.status(400).json({ status: 'error', message: 'Missing store association (ownerId).' });
            }

            const { id } = req.params;
            const input = req.body;
            const result = await facilityService.updateTask(id, ownerId, input);
            res.json(result);
        } catch (error) {
            res.status(500).json({ status: 'error', message: error.message });
        }
    }

    async deleteTask(req, res) {
        try {
            if (req.user.role !== 'OWNER' && req.user.role !== 'ADMIN') {
                return res.status(403).json({ status: 'error', message: 'Unauthorized. Only owners and admins can delete tasks.' });
            }

            const ownerId = req.user.ownerId;
            if (!ownerId) {
                return res.status(400).json({ status: 'error', message: 'Missing store association (ownerId).' });
            }

            const { id } = req.params;
            const result = await facilityService.deleteTask(id, ownerId);
            res.json(result);
        } catch (error) {
            res.status(500).json({ status: 'error', message: error.message });
        }
    }
}
