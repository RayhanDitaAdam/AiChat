import { Router } from 'express';
import { scrapeTokopedia } from './scraper.controller.js';
import { authenticate } from '../../common/middleware/auth.middleware.js';
import { requireStaffOrOwner } from '../../common/middleware/rbac.middleware.js';

const router = Router();

// Trigger a Tokopedia scrape for a specific store name
router.post('/tokopedia', authenticate, requireStaffOrOwner(), scrapeTokopedia);

export default router;
