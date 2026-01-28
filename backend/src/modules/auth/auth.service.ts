import { OAuth2Client } from 'google-auth-library';
import { prisma } from '../../common/services/prisma.service.js';
import { JWTService } from '../../common/services/jwt.service.js';
import type { GoogleTokenInput, RegisterInput, LoginInput } from './auth.schema.js';
import { Role } from '../../common/types/auth.types.js';
import { PasswordUtil } from '../../common/utils/password.util.js';

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
     * Register new user with email and password
     */
    /**
     * Register new user with email and password
     */
    async register(input: RegisterInput) {
        // Validate password strength
        const passwordValidation = PasswordUtil.validateStrength(input.password);
        if (!passwordValidation.valid) {
            throw new Error(passwordValidation.message || 'Invalid password');
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email: input.email },
        });

        if (existingUser) {
            throw new Error('User with this email already exists');
        }

        // Hash password
        const hashedPassword = await PasswordUtil.hash(input.password);
        const role = (input.role as Role) || Role.USER;

        // Create new user (and Owner if applicable) in transaction
        const user = await prisma.$transaction(async (tx) => {
            const newUser = await tx.user.create({
                data: {
                    email: input.email,
                    password: hashedPassword,
                    name: input.name,
                    role: role,
                },
            });

            if (role === Role.OWNER) {
                if (!input.domain) {
                    throw new Error('Domain is required for Owner');
                }

                // Check if domain is taken
                const existingOwner = await tx.owner.findUnique({
                    where: { domain: input.domain }
                });

                if (existingOwner) {
                    throw new Error('Domain already taken');
                }

                // Create Owner record
                const newOwner = await tx.owner.create({
                    data: {
                        name: input.name,
                        domain: input.domain,
                        user: {
                            connect: { id: newUser.id }
                        }
                    }
                });

                // Update user with ownerId (redundant relationship update but good for cache/consistency if needed, 
                // though basic relation is already handled. Actually schema has `ownerId` on User as foreign key? 
                // Let's check schema. User has `ownerId` @unique referencing Owner? 
                // Schema: User -> ownerId -> Owner. Owner -> user -> User? 
                // Schema says: 
                // model User { ownerId String? @unique, owner Owner? @relation(...) }
                // model Owner { user User? }
                // Wait, typically Owner has `userId`. But here User has `ownerId`. 
                // If User has ownerId, then we must update User AFTER creating Owner.

                await tx.user.update({
                    where: { id: newUser.id },
                    data: { ownerId: newOwner.id }
                });

                // Return updated user
                return await tx.user.findUniqueOrThrow({ where: { id: newUser.id } });
            }

            return newUser;
        });

        // Generate JWT token
        const jwtToken = JWTService.generateToken({
            userId: user.id,
            email: user.email,
            role: user.role,
        });

        return {
            status: 'success',
            message: 'Registration successful',
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
    }

    /**
     * Login with email and password
     */
    async login(input: LoginInput) {
        // Find user by email
        const user = await prisma.user.findUnique({
            where: { email: input.email },
        });

        if (!user || !user.password) {
            throw new Error('Invalid email or password');
        }

        // Verify password
        const isPasswordValid = await PasswordUtil.compare(input.password, user.password);
        if (!isPasswordValid) {
            throw new Error('Invalid email or password');
        }

        // Generate JWT token
        const jwtToken = JWTService.generateToken({
            userId: user.id,
            email: user.email,
            role: user.role,
        });

        return {
            status: 'success',
            message: 'Login successful',
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
