import { Router } from 'express';
import { LandingController } from './landing.controller.js';
import { authenticate } from '../../common/middleware/auth.middleware.js';
import { requireRole } from '../../common/middleware/rbac.middleware.js';
import { Role } from '../../common/types/auth.types.js';

const router = Router();
const landingController = new LandingController();

// Publicly accessible route to read landing sections
router.get('/sections', (req, res) => landingController.getPublicSections(req, res));
router.get('/config', (req, res) => landingController.getPageConfig(req, res));

// All routes below require Admin or Super Admin role
router.use(authenticate, requireRole(Role.ADMIN, Role.SUPER_ADMIN));

router.get('/admin/config', (req, res) => landingController.getPageConfig(req, res));
router.post('/admin/config', (req, res) => landingController.updatePageConfig(req, res));
router.post('/admin/config/preview-token', (req, res) => landingController.generatePreviewToken(req, res));

router.get('/admin/sections', (req, res) => landingController.getAdminSections(req, res));
router.post('/admin/sections', (req, res) => landingController.createSection(req, res));
router.post('/admin/sections/:id/draft', (req, res) => landingController.saveDraft(req, res));
router.post('/admin/sections/:id/publish', (req, res) => landingController.publishSection(req, res));
router.get('/admin/sections/:id/revisions', (req, res) => landingController.getRevisionHistory(req, res));
router.post('/admin/revisions/:id/restore', (req, res) => landingController.restoreRevision(req, res));

router.put('/admin/sections/:id', (req, res) => landingController.updateSection(req, res));
router.delete('/admin/sections/:id', (req, res) => landingController.deleteSection(req, res));
router.post('/admin/sections/reorder', (req, res) => landingController.reorderSections(req, res));

export default router;
