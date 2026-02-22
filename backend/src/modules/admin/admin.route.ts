import { Router, type Router as ExpressRouter } from 'express';
import { AdminController } from './admin.controller.js';
import { authenticate } from '../../common/middleware/auth.middleware.js';
import { requireAdmin, requireSuperAdmin, requireRole } from '../../common/middleware/rbac.middleware.js';
import { Role } from '../../common/types/auth.types.js';

const router: ExpressRouter = Router();
const adminController = new AdminController();

// All routes require Admin or Super Admin role
router.use(authenticate, requireRole(Role.ADMIN, Role.SUPER_ADMIN));

router.get('/stats', (req, res) => adminController.getStats(req, res));
router.get('/missing-requests', (req, res) => adminController.getMissingRequests(req, res));
router.get('/owners', (req, res) => adminController.getOwners(req, res));
router.post('/owners', (req, res) => adminController.createOwner(req, res));
router.patch('/owners/:ownerId', (req, res) => adminController.updateOwner(req, res));
router.delete('/owners/:ownerId', (req, res) => adminController.deleteOwner(req, res));
router.patch('/owners/:ownerId/approve', (req, res) => adminController.approveOwner(req, res));
router.patch('/owners/:ownerId/config', (req, res) => adminController.updateOwnerConfig(req, res));
router.patch('/owners/:ownerId/category', (req, res) => adminController.updateOwnerCategory(req, res));
router.get('/system/config', (req, res) => adminController.getSystemConfig(req, res));
router.patch('/system/config', (req, res) => adminController.updateSystemConfig(req, res));

// User & Menu Management
router.get('/users', (req, res) => adminController.getUsers(req, res));
router.patch('/users/:userId/menus', (req, res) => adminController.updateUserMenus(req, res));
router.patch('/users/:userId/block', (req, res) => adminController.toggleUserBlock(req, res));

// Super Admin Only
router.get('/super/admins', requireSuperAdmin(), (req, res) => adminController.getAdmins(req, res));
router.post('/super/admins', requireSuperAdmin(), (req, res) => adminController.createAdmin(req, res));
router.patch('/super/admins/:userId', requireSuperAdmin(), (req, res) => adminController.updateAdmin(req, res));
router.delete('/super/admins/:userId', requireSuperAdmin(), (req, res) => adminController.deleteAdmin(req, res));

export default router;
