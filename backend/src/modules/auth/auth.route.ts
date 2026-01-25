import { Router, type Router as ExpressRouter } from 'express';
import { AuthController } from './auth.controller.js';
import { GoogleTokenSchema } from './auth.schema.js';
import { validate } from '../../common/middleware/zod.middleware.js';
import { authenticate } from '../../common/middleware/auth.middleware.js';

const router: ExpressRouter = Router();
const authController = new AuthController();

// POST /api/auth/google - Login with Google
router.post('/google', validate(GoogleTokenSchema), (req, res) =>
    authController.googleAuth(req, res)
);

// GET /api/auth/me - Get current user profile
router.get('/me', authenticate, (req, res) =>
    authController.getProfile(req, res)
);

export default router;
