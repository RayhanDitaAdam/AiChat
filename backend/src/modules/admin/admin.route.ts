import { Router, type Router as ExpressRouter } from 'express';
import { AdminController } from './admin.controller.js';
import { authenticate } from '../../common/middleware/auth.middleware.js';
import { requireAdmin } from '../../common/middleware/rbac.middleware.js';

const router: ExpressRouter = Router();
const adminController = new AdminController();

// All routes require Admin role
router.use(authenticate, requireAdmin());

router.get('/stats', (req, res) => adminController.getStats(req, res));
router.get('/missing-requests', (req, res) => adminController.getMissingRequests(req, res));
router.get('/owners', (req, res) => adminController.getOwners(req, res));
router.patch('/owners/:ownerId/approve', (req, res) => adminController.approveOwner(req, res));
router.patch('/owners/:ownerId/config', (req, res) => adminController.updateOwnerConfig(req, res));
router.get('/system/config', (req, res) => adminController.getSystemConfig(req, res));
router.patch('/system/config', (req, res) => adminController.updateSystemConfig(req, res));

// User & Menu Management
router.get('/users', (req, res) => adminController.getUsers(req, res));
router.patch('/users/:userId/menus', (req, res) => adminController.updateUserMenus(req, res));
router.patch('/users/:userId/block', (req, res) => adminController.toggleUserBlock(req, res));

export default router;
