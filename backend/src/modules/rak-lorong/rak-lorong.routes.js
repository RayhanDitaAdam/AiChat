import { Router } from 'express';
import { getLorongs, createLorong, createRak, deleteLorong, deleteRak } from './rak-lorong.controller.js';
import { authenticate } from '../../common/middleware/auth.middleware.js';
import { requireStaffOrOwner } from '../../common/middleware/rbac.middleware.js';

const router = Router();

// Retrieve all lorongs for an owner
router.get('/', authenticate, requireStaffOrOwner(), getLorongs);

// Create a new lorong
router.post('/', authenticate, requireStaffOrOwner(), createLorong);

// Delete a lorong
router.delete('/:id', authenticate, requireStaffOrOwner(), deleteLorong);

// RAK ROUTES
// Create a rak within a given lorong
router.post('/rak/:lorongId', authenticate, requireStaffOrOwner(), createRak);

// Delete a rak
router.delete('/rak/:id', authenticate, requireStaffOrOwner(), deleteRak);

export default router;
