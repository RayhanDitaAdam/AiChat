import { Router, type Router as ExpressRouter } from 'express';
import { BuildingController } from './building.controller.js';
import { authenticate } from '../../common/middleware/auth.middleware.js';
import { requireOwner, requireApproved } from '../../common/middleware/rbac.middleware.js';

const router: ExpressRouter = Router();
const buildingController = new BuildingController();

// PUBLIC/SHARED routes
router.get('/:ownerId', authenticate, (req, res) => buildingController.getSubLocations(req, res));

// OWNER routes
router.post('/',
    authenticate,
    requireOwner(),
    requireApproved(),
    (req, res) => buildingController.createSubLocation(req, res)
);

router.patch('/:id',
    authenticate,
    requireOwner(),
    requireApproved(),
    (req, res) => buildingController.updateSubLocation(req, res)
);

router.delete('/:id',
    authenticate,
    requireOwner(),
    requireApproved(),
    (req, res) => buildingController.deleteSubLocation(req, res)
);

export default router;
