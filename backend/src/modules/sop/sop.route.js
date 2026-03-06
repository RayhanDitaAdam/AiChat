import { Router, } from 'express';
import { SopController } from './sop.controller.js';
import { authenticate } from '../../common/middleware/auth.middleware.js';
import { requireStaffOrOwner, requireApproved } from '../../common/middleware/rbac.middleware.js';
import { documentUpload } from '../../common/middleware/document.middleware.js';

const router = Router();
const sopController = new SopController();

// All SOP routes require authenticated staff or owner of an approved store
router.use(authenticate, requireStaffOrOwner(), requireApproved());

router.post('/upload', documentUpload.single('file'), (req, res) =>
    sopController.uploadSop(req, res)
);

router.get('/', (req, res) =>
    sopController.getSops(req, res)
);

router.delete('/:id', (req, res) =>
    sopController.deleteSop(req, res)
);

router.put('/:id', (req, res) =>
    sopController.updateSopText(req, res)
);

export default router;
