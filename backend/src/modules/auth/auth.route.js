import { Router, } from 'express';
import { AuthController } from './auth.controller.js';
import { GoogleTokenSchema, UpdateProfileSchema, RegisterSchema, LoginSchema, ForgotPasswordSchema, ResetPasswordSchema } from './auth.schema.js';
import { validate } from '../../common/middleware/zod.middleware.js';
import { authenticate } from '../../common/middleware/auth.middleware.js';
import rateLimit from 'express-rate-limit';

const authRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // TODO: revert to 10 after dev
    message: { status: 'error', message: 'Too many authentication attempts, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
});


const router = Router();
const authController = new AuthController();

// AUTH routes
router.post('/register', authRateLimit, validate(RegisterSchema), (req, res) =>
    authController.register(req, res)
);

router.post('/login', authRateLimit, validate(LoginSchema), (req, res) =>
    authController.login(req, res)
);

router.all('/verify-email', (req, res) =>
    authController.verifyEmail(req, res)
);

router.post('/verify-key-file', (req, res) =>
    authController.verifyKeyFile(req, res)
);

router.post('/google', validate(GoogleTokenSchema), (req, res) =>
    authController.googleAuth(req, res)
);

router.post('/github', (req, res) =>
    authController.githubAuth(req, res)
);

router.post('/refresh', (req, res) =>
    authController.refresh(req, res)
);

router.post('/forgot-password', authRateLimit, validate(ForgotPasswordSchema), (req, res) =>
    authController.forgotPassword(req, res)
);

router.get('/validate-reset-token', (req, res) =>
    authController.validateToken(req, res)
);

router.post('/reset-password', authRateLimit, validate(ResetPasswordSchema), (req, res) =>
    authController.resetPassword(req, res)
);

router.get('/me', authenticate, (req, res) =>
    authController.getProfile(req, res)
);

router.patch('/profile', authenticate, validate(UpdateProfileSchema), (req, res) =>
    authController.updateProfile(req, res)
);

router.get('/stores', (req, res) =>
    authController.getStores(req, res)
);

router.post('/join-store', authenticate, (req, res) =>
    authController.joinStore(req, res)
);

// 2FA Routes
router.post('/2fa/setup', authenticate, (req, res) =>
    authController.setup2FA(req, res)
);

router.post('/2fa/verify', authenticate, (req, res) =>
    authController.verify2FA(req, res)
);

router.post('/2fa/disable', authenticate, (req, res) =>
    authController.disable2FA(req, res)
);

router.post('/2fa/login', authRateLimit, (req, res) =>
    authController.login2FA(req, res)
);

router.post('/2fa/resend', authRateLimit, (req, res) =>
    authController.resend2FA(req, res)
);

router.post('/link-google', authenticate, (req, res) =>
    authController.linkGoogle(req, res)
);

router.post('/unlink-google', authenticate, (req, res) =>
    authController.unlinkGoogle(req, res)
);

export default router;
