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
            // ORIGINAL CODE (Commented for testing)
            /*
            const result = await authService.authenticateWithGoogle(req.body);
            return res.json(result);
            */

            // BYPASS GOOGLE AUTH FOR TESTING
            const isOwnerTest = req.body.token === 'test-owner-token';

            const dummyUser = isOwnerTest ? {
                id: '614bd2e3-08bd-4451-a90a-93cad29db2d9', // Seeded as OWNER
                email: 'user@example.com',
                name: 'User Demo',
                image: null,
                role: 'OWNER',
                ownerId: 'e0449386-8bfb-4b3f-be75-6d67bd81a825',
            } : {
                id: 'd6e8b422-540e-436d-9c37-4d6d63cb5f12', // Seeded as USER
                email: 'real@user.com',
                name: 'Real User',
                image: null,
                role: 'USER',
                ownerId: null,
            };

            const token = JWTService.generateToken({
                userId: dummyUser.id,
                email: dummyUser.email,
                role: dummyUser.role as any,
            });

            return res.json({
                status: 'success',
                token,
                user: dummyUser
            });

        } catch (error) {
            console.error('Google Auth Controller Error:', error);
            return res.status(400).json({
                status: 'error',
                message: error instanceof Error ? error.message : 'Authentication failed'
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
            return res.json(result); `1`
        } catch (error) {
            console.error('Get Profile Controller Error:', error);
            return res.status(404).json({
                status: 'error',
                message: error instanceof Error ? error.message : 'Failed to fetch profile'
            });
        }
    }
}
