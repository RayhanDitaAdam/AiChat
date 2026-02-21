import type { Request, Response } from 'express';
import { AuthService } from './auth.service.js';
import { JWTService } from '../../common/services/jwt.service.js';
import { Role } from '../../common/types/auth.types.js';

const authService = new AuthService();

export class AuthController {
    /**
     * POST /api/auth/google
     * Authenticate with Google OAuth token
     */
    async googleAuth(req: Request, res: Response) {
        try {
            const result = await authService.authenticateWithGoogle(req.body);
            return res.json(result);

        } catch (error) {
            console.error('Google Auth Controller Error:', error);
            return res.status(400).json({
                status: 'error',
                message: error instanceof Error ? error.message : 'Authentication failed'
            });
        }
    }

    /**
     * POST /api/auth/github
     * Authenticate with GitHub OAuth code
     */
    async githubAuth(req: Request, res: Response) {
        try {
            const { code } = req.body;
            if (!code) {
                return res.status(400).json({ status: 'error', message: 'GitHub code is required' });
            }

            const result = await authService.authenticateWithGitHub(code);
            return res.json(result);
        } catch (error) {
            console.error('GitHub Auth Controller Error:', error);
            return res.status(400).json({
                status: 'error',
                message: error instanceof Error ? error.message : 'Authentication failed'
            });
        }
    }

    /**
     * POST /api/auth/register
     * Register with email and password
     */
    async register(req: Request, res: Response) {
        try {
            const result = await authService.register(req.body);
            return res.status(201).json(result);
        } catch (error) {
            console.error('Register Controller Error:', error);
            return res.status(400).json({ status: 'error', message: error instanceof Error ? error.message : 'Registration failed' });
        }
    }

    async verifyEmail(req: Request, res: Response) {
        try {
            // Support both GET (query) and POST (body)
            const email = (req.query.email as string) || req.body.email;
            const code = (req.query.code as string) || req.body.code;

            if (!email || !code) {
                return res.status(400).json({ status: 'error', message: 'Email and code are required' });
            }

            const result = await authService.verifyEmail(email, code);
            return res.json(result);
        } catch (error: any) {
            return res.status(400).json({ status: 'error', message: error.message });
        }
    }

    /**
     * POST /api/auth/login
     * Login with email and password
     */
    async login(req: Request, res: Response) {
        try {
            const result = await authService.login(req.body);
            return res.json(result);
        } catch (error: any) {
            console.error('Login Controller Error:', error);
            const statusCode = error.statusCode || 401;
            return res.status(statusCode).json({
                status: 'error',
                message: error instanceof Error ? error.message : 'Login failed'
            });
        }
    }

    /**
     * GET /api/auth/me
     * Get current user profile
     */
    async getProfile(req: Request, res: Response) {
        try {
            if (!req.user) {
                return res.status(401).json({
                    status: 'error',
                    message: 'Not authenticated'
                });
            }

            const result = await authService.getUserProfile(req.user.id);
            return res.json(result);
        } catch (error) {
            console.error('Get Profile Controller Error:', error);
            return res.status(404).json({
                status: 'error',
                message: error instanceof Error ? error.message : 'Failed to fetch profile'
            });
        }
    }

    /**
     * PATCH /api/auth/profile
     * Update current user profile
     */
    async updateProfile(req: Request, res: Response) {
        try {
            if (!req.user) {
                return res.status(401).json({
                    status: 'error',
                    message: 'Not authenticated'
                });
            }

            const result = await authService.updateProfile(req.user.id, req.body);
            return res.json(result);
        } catch (error) {
            console.error('Update Profile Controller Error:', error);
            return res.status(500).json({
                status: 'error',
                message: error instanceof Error ? error.message : 'Failed to update profile'
            });
        }
    }

    /**
     * POST /api/auth/refresh
     * Refresh access token using refresh token
     */
    async refresh(req: Request, res: Response) {
        try {
            const { refreshToken } = req.body;
            if (!refreshToken) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Refresh token is required'
                });
            }

            const result = await authService.refreshTokens(refreshToken);
            return res.json(result);
        } catch (error) {
            console.error('Refresh Token Controller Error:', error);
            return res.status(401).json({
                status: 'error',
                message: error instanceof Error ? error.message : 'Failed to refresh token'
            });
        }
    }

    /**
     * GET /api/auth/stores
     */
    async getStores(req: Request, res: Response) {
        try {
            const result = await authService.getPublicStores();
            return res.json(result);
        } catch (error) {
            console.error('Get Stores Error:', error);
            return res.status(500).json({ status: 'error', message: 'Failed to fetch stores' });
        }
    }

    /**
     * POST /api/auth/join-store
     */
    async joinStore(req: Request, res: Response) {
        try {
            if (!req.user) return res.status(401).json({ status: 'error', message: 'Unauthorized' });

            const { storeId } = req.body;
            if (!storeId) return res.status(400).json({ status: 'error', message: 'Store ID is required' });

            const result = await authService.joinStore(req.user.id, storeId);
            return res.json(result);
        } catch (error) {
            console.error('Join Store Error:', error);
            return res.status(400).json({ status: 'error', message: error instanceof Error ? error.message : 'Failed to join store' });
        }
    }

    /**
     * POST /api/auth/forgot-password
     */
    async forgotPassword(req: Request, res: Response) {
        try {
            const { email } = req.body;
            const result = await authService.forgotPassword(email);
            return res.json(result);
        } catch (error: any) {
            return res.status(400).json({ status: 'error', message: error.message });
        }
    }

    /**
     * POST /api/auth/reset-password
     */
    async resetPassword(req: Request, res: Response) {
        try {
            const result = await authService.resetPassword(req.body);
            return res.json(result);
        } catch (error: any) {
            const statusCode = error.statusCode || 400;
            return res.status(statusCode).json({ status: 'error', message: error.message });
        }
    }

    /**
     * POST /api/auth/2fa/setup
     */
    async setup2FA(req: Request, res: Response) {
        try {
            if (!req.user) return res.status(401).json({ status: 'error', message: 'Unauthorized' });
            const result = await authService.enable2FA(req.user.id);
            return res.json(result);
        } catch (error: any) {
            return res.status(400).json({ status: 'error', message: error.message });
        }
    }

    /**
     * POST /api/auth/2fa/verify - No longer needed for email-based 2FA
     * Kept for backward compatibility, just returns success
     */
    async verify2FA(req: Request, res: Response) {
        try {
            if (!req.user) return res.status(401).json({ status: 'error', message: 'Unauthorized' });
            return res.json({ status: 'success', message: 'Email-based 2FA is now active' });
        } catch (error: any) {
            return res.status(400).json({ status: 'error', message: error.message });
        }
    }

    /**
     * POST /api/auth/2fa/disable
     */
    async disable2FA(req: Request, res: Response) {
        try {
            if (!req.user) return res.status(401).json({ status: 'error', message: 'Unauthorized' });
            const result = await authService.disable2FA(req.user.id);
            return res.json(result);
        } catch (error: any) {
            return res.status(400).json({ status: 'error', message: error.message });
        }
    }

    /**
     * POST /api/auth/2fa/login
     */
    async login2FA(req: Request, res: Response) {
        try {
            const { userId, code } = req.body;
            const result = await authService.login2FA(userId, code);
            return res.json(result);
        } catch (error: any) {
            return res.status(401).json({ status: 'error', message: error.message });
        }
    }

    /**
     * POST /api/auth/2fa/resend
     */
    async resend2FA(req: Request, res: Response) {
        try {
            const { userId } = req.body;
            if (!userId) {
                return res.status(400).json({ status: 'error', message: 'User ID is required' });
            }
            const result = await authService.resend2FA(userId);
            return res.json(result);
        } catch (error: any) {
            return res.status(400).json({ status: 'error', message: error.message });
        }
    }
}
