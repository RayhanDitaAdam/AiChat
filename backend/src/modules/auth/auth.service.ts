import { OAuth2Client } from 'google-auth-library';
import { prisma } from '../../common/services/prisma.service.js';
import { JWTService } from '../../common/services/jwt.service.js';
import type { GoogleTokenInput } from './auth.schema.js';
import { Role } from '../../common/types/auth.types.js';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

interface GooglePayload {
    email?: string;
    name?: string;
    picture?: string;
    sub?: string; // Google user ID
}

export class AuthService {
    /**
     * Verify Google token and create/update user
     */
    async authenticateWithGoogle(input: GoogleTokenInput) {
        try {
            // Verify Google token
            const ticket = await googleClient.verifyIdToken({
                idToken: input.token,
                audience: GOOGLE_CLIENT_ID,
            });

            const payload = ticket.getPayload() as GooglePayload;

            if (!payload || !payload.email || !payload.sub) {
                throw new Error('Invalid Google token payload');
            }

            // Find or create user in database
            let user = await prisma.user.findUnique({
                where: { googleId: payload.sub },
            });

            if (!user) {
                // Check if user exists with this email
                user = await prisma.user.findUnique({
                    where: { email: payload.email },
                });

                if (user) {
                    // Link google account to existing user
                    user = await prisma.user.update({
                        where: { id: user.id },
                        data: {
                            googleId: payload.sub,
                            name: payload.name || user.name,
                            image: payload.picture || user.image,
                        },
                    });
                } else {
                    // Create new user
                    user = await prisma.user.create({
                        data: {
                            email: payload.email,
                            googleId: payload.sub,
                            name: payload.name || null,
                            image: payload.picture || null,
                            role: Role.USER, // Default role
                        },
                    });
                }
            }

            // Generate JWT token
            const jwtToken = JWTService.generateToken({
                userId: user.id,
                email: user.email,
                role: user.role,
            });

            return {
                status: 'success',
                token: jwtToken,
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    image: user.image,
                    role: user.role,
                    ownerId: user.ownerId,
                },
            };
        } catch (error) {
            console.error('Google authentication error:', error);
            throw new Error('Failed to authenticate with Google');
        }
    }

    /**
     * Get user profile from database
     */
    async getUserProfile(userId: string) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                name: true,
                image: true,
                role: true,
                language: true,
                ownerId: true,
                owner: {
                    select: {
                        id: true,
                        name: true,
                        domain: true,
                    },
                },
            } as any,
        });

        if (!user) {
            throw new Error('User not found');
        }

        return {
            status: 'success',
            user,
        };
    }

    /**
     * Update user profile
     */
    async updateProfile(userId: string, data: any) {
        const user = await prisma.user.update({
            where: { id: userId },
            data,
        });

        return {
            status: 'success',
            message: 'Profile updated successfully',
            user,
        };
    }
}
