import { Router } from 'express';
import { VacancyController } from './vacancy.controller.js';
import { authenticate } from '../../common/middleware/auth.middleware.js';
import { validate } from '../../common/middleware/zod.middleware.js';
import { CreateVacancySchema, UpdateVacancySchema, CreateApplicationSchema, UpdateApplicationStatusSchema } from './vacancy.schema.js';
import { requireOwner, requireApproved } from '../../common/middleware/rbac.middleware.js';
const router = Router();
const vacancyController = new VacancyController();
// PUBLIC routes
router.get('/public', (req, res) => vacancyController.getAllVacancies(req, res));
// OWNER routes
router.post('/', authenticate, requireOwner(), requireApproved(), validate(CreateVacancySchema), (req, res) => vacancyController.createVacancy(req, res));
router.get('/owner', authenticate, requireOwner(), requireApproved(), (req, res) => vacancyController.getOwnerVacancies(req, res));
router.get('/owner/all-applicants', authenticate, requireOwner(), requireApproved(), (req, res) => vacancyController.getAllApplicants(req, res));
router.patch('/:id', authenticate, requireOwner(), requireApproved(), validate(UpdateVacancySchema), (req, res) => vacancyController.updateVacancy(req, res));
router.delete('/:id', authenticate, requireOwner(), requireApproved(), (req, res) => vacancyController.deleteVacancy(req, res));
// USER/STAFF application routes
router.get('/my-applications', authenticate, (req, res) => vacancyController.getUserApplications(req, res));
router.post('/:vacancyId/apply', authenticate, validate(CreateApplicationSchema), (req, res) => vacancyController.applyToVacancy(req, res));
// OWNER application management routes
router.get('/:vacancyId/applicants', authenticate, requireOwner(), requireApproved(), (req, res) => vacancyController.getApplicants(req, res));
router.patch('/applications/:id/status', authenticate, requireOwner(), requireApproved(), validate(UpdateApplicationStatusSchema), (req, res) => vacancyController.updateApplicationStatus(req, res));
export default router;
//# sourceMappingURL=vacancy.route.js.map