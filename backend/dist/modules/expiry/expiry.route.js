import { Router } from 'express';
import { ExpiryController } from './expiry.controller.js';
import { authenticate } from '../../common/middleware/auth.middleware.js';
import { requireStaffOrOwner, requireApproved } from '../../common/middleware/rbac.middleware.js';
const router = Router();
const expiryController = new ExpiryController();
router.use(authenticate, requireStaffOrOwner(), requireApproved());
router.get('/', (req, res) => expiryController.getExpiries(req, res));
router.post('/', (req, res) => expiryController.createExpiry(req, res));
router.delete('/:id', (req, res) => expiryController.deleteExpiry(req, res));
router.post('/:id/products', (req, res) => expiryController.assignProduct(req, res));
router.delete('/:id/products/:productId', (req, res) => expiryController.removeProduct(req, res));
export default router;
//# sourceMappingURL=expiry.route.js.map