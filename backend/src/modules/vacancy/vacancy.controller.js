
import { VacancyService } from './vacancy.service.js';

const vacancyService = new VacancyService();

export class VacancyController {
    async createVacancy(req, res) {
        try {
            if (!req.user || req.user.role !== 'OWNER' || !req.user.ownerId) {
                return res.status(403).json({ status: 'error', message: 'Forbidden' });
            }
            const result = await vacancyService.createVacancy(req.user.ownerId, req.body);
            return res.status(201).json(result);
        } catch (error) {
            return res.status(500).json({ status: 'error', message: error.message });
        }
    }

    async getOwnerVacancies(req, res) {
        try {
            if (!req.user || req.user.role !== 'OWNER' || !req.user.ownerId) {
                return res.status(403).json({ status: 'error', message: 'Forbidden' });
            }
            const result = await vacancyService.getVacancies(req.user.ownerId);
            return res.json(result);
        } catch (error) {
            return res.status(500).json({ status: 'error', message: error.message });
        }
    }

    async getAllVacancies(req, res) {
        try {
            const result = await vacancyService.getAllPublicVacancies();
            return res.json(result);
        } catch (error) {
            return res.status(500).json({ status: 'error', message: error.message });
        }
    }

    async updateVacancy(req, res) {
        try {
            if (!req.user || req.user.role !== 'OWNER' || !req.user.ownerId) {
                return res.status(403).json({ status: 'error', message: 'Forbidden' });
            }
            const id = req.params.id ;
            const result = await vacancyService.updateVacancy(id, req.user.ownerId, req.body);
            return res.json(result);
        } catch (error) {
            return res.status(500).json({ status: 'error', message: error.message });
        }
    }

    async deleteVacancy(req, res) {
        try {
            if (!req.user || req.user.role !== 'OWNER' || !req.user.ownerId) {
                return res.status(403).json({ status: 'error', message: 'Forbidden' });
            }
            const id = req.params.id ;
            const result = await vacancyService.deleteVacancy(id, req.user.ownerId);
            return res.json(result);
        } catch (error) {
            return res.status(500).json({ status: 'error', message: error.message });
        }
    }

    async applyToVacancy(req, res) {
        try {
            if (!req.user) {
                return res.status(401).json({ status: 'error', message: 'Unauthorized' });
            }
            const vacancyId = req.params.vacancyId ;
            const { reason } = req.body;
            const result = await vacancyService.applyToVacancy(req.user.id, vacancyId, reason);
            return res.status(201).json(result);
        } catch (error) {
            return res.status(500).json({ status: 'error', message: error.message });
        }
    }

    async getAllApplicants(req, res) {
        try {
            if (!req.user || req.user.role !== 'OWNER' || !req.user.ownerId) {
                return res.status(403).json({ status: 'error', message: 'Forbidden' });
            }
            const result = await vacancyService.getAllApplicantsForOwner(req.user.ownerId);
            return res.json(result);
        } catch (error) {
            return res.status(500).json({ status: 'error', message: error.message });
        }
    }

    async getApplicants(req, res) {
        try {
            if (!req.user || req.user.role !== 'OWNER' || !req.user.ownerId) {
                return res.status(403).json({ status: 'error', message: 'Forbidden' });
            }
            const vacancyId = req.params.vacancyId ;
            const result = await vacancyService.getApplicantsForVacancy(req.user.ownerId, vacancyId);
            return res.json(result);
        } catch (error) {
            return res.status(500).json({ status: 'error', message: error.message });
        }
    }

    async getUserApplications(req, res) {
        try {
            if (!req.user) {
                return res.status(401).json({ status: 'error', message: 'Unauthorized' });
            }
            const result = await vacancyService.getUserApplications(req.user.id);
            return res.json(result);
        } catch (error) {
            return res.status(500).json({ status: 'error', message: error.message });
        }
    }

    async updateApplicationStatus(req, res) {
        try {
            if (!req.user || req.user.role !== 'OWNER' || !req.user.ownerId) {
                return res.status(403).json({ status: 'error', message: 'Forbidden' });
            }
            const id = req.params.id ;
            const { status } = req.body;
            const result = await vacancyService.updateApplicationStatus(req.user.ownerId, id, status);
            return res.json(result);
        } catch (error) {
            return res.status(500).json({ status: 'error', message: error.message });
        }
    }
}
