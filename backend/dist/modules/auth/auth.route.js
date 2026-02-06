import { Router } from 'express';
import { AuthController } from './auth.controller.js';
import { GoogleTokenSchema, UpdateProfileSchema, RegisterSchema, LoginSchema } from './auth.schema.js';
import { validate } from '../../common/middleware/zod.middleware.js';
import { authenticate } from '../../common/middleware/auth.middleware.js';
const router = Router();
const authController = new AuthController();
// AUTH routes
router.post('/register', validate(RegisterSchema), (req, res) => authController.register(req, res));
router.post('/login', validate(LoginSchema), (req, res) => authController.login(req, res));
router.all('/verify-email', (req, res) => authController.verifyEmail(req, res));
router.post('/google', validate(GoogleTokenSchema), (req, res) => authController.googleAuth(req, res));
router.post('/github', (req, res) => authController.githubAuth(req, res));
router.post('/refresh', (req, res) => authController.refresh(req, res));
router.get('/me', authenticate, (req, res) => authController.getProfile(req, res));
router.patch('/profile', authenticate, validate(UpdateProfileSchema), (req, res) => authController.updateProfile(req, res));
router.get('/stores', authenticate, (req, res) => authController.getStores(req, res));
router.post('/join-store', authenticate, (req, res) => authController.joinStore(req, res));
export default router;
//# sourceMappingURL=auth.route.js.map