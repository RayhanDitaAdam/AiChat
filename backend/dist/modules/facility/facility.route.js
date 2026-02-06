import { Router } from 'express';
import { FacilityController } from './facility.controller.js';
import { authenticate } from '../../common/middleware/auth.middleware.js';
const router = Router();
const facilityController = new FacilityController();
// All facility routes require authentication
router.use(authenticate);
router.post('/tasks', facilityController.createAssignment);
router.get('/tasks', facilityController.getTasks);
router.patch('/tasks/:id/report', facilityController.updateReport);
export default router;
//# sourceMappingURL=facility.route.js.map