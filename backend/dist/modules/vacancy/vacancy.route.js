import { Router } from 'express';
import { VacancyController } from './vacancy.controller.js';
import { authenticate } from '../../common/middleware/auth.middleware.js';
import { validate } from '../../common/middleware/zod.middleware.js';
import { CreateVacancySchema, UpdateVacancySchema } from './vacancy.schema.js';
import { requireOwner, requireApproved } from '../../common/middleware/rbac.middleware.js';
const router = Router();
const vacancyController = new VacancyController();
// PUBLIC routes
router.get('/public', (req, res) => vacancyController.getAllVacancies(req, res));
// OWNER routes
router.post('/', authenticate, requireOwner(), requireApproved(), validate(CreateVacancySchema), (req, res) => vacancyController.createVacancy(req, res));
router.get('/owner', authenticate, requireOwner(), requireApproved(), (req, res) => vacancyController.getOwnerVacancies(req, res));
router.patch('/:id', authenticate, requireOwner(), requireApproved(), validate(UpdateVacancySchema), (req, res) => vacancyController.updateVacancy(req, res));
router.delete('/:id', authenticate, requireOwner(), requireApproved(), (req, res) => vacancyController.deleteVacancy(req, res));
export default router;
//# sourceMappingURL=vacancy.route.js.map