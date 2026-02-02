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
                    phone: user.phone,
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
    /**
     * Generate unique customer ID (CUST-0012345 format)
     */
    private async generateCustomerId(): Promise<string> {
        const randomDigits = Math.floor(1000000 + Math.random() * 9000000).toString();
        const customerId = `CUST-${randomDigits}`;

        // Ensure uniqueness
        const exists = await (prisma.user as any).findUnique({ where: { customerId } });
        if (exists) return this.generateCustomerId();

        return customerId;
    }

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
            const userData: any = {
                email: input.email,
                password: hashedPassword,
                name: input.name,
                role: role,
                phone: input.phone,
            };

            // Auto-generate membership ID/QR for ALL users (including Owners)
            userData.customerId = await this.generateCustomerId();
            userData.qrCode = userData.customerId;

            // Manggaleh Flow: Auto-associate with store for regular users
            if (role === Role.USER) {
                // Association with store if domain provided
                if ((input as any).ownerDomain) {
                    const store = await tx.owner.findUnique({
                        where: { domain: (input as any).ownerDomain }
                    });
                    if (store) {
                        userData.memberOfId = store.id;
                    }
                }
            }

            const newUser = await tx.user.create({
                data: userData,
            });

            if (role === Role.OWNER) {
                // Ensure storeName and domain are present (Schema already validates, but good for type safety)
                if (!input.domain || !(input as any).storeName) {
                    throw new Error('Domain and Store Name are required for Owner');
                }

                const storeName = (input as any).storeName;

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
                        name: storeName, // Use the specific Store Name
                        domain: input.domain,
                        user: {
                            connect: { id: newUser.id }
                        }
                    }
                });

                await tx.user.update({
                    where: { id: newUser.id },
                    data: { ownerId: newOwner.id }
                });

                // Return updated user with owner details
                return await tx.user.findUniqueOrThrow({
                    where: { id: newUser.id },
                    include: { owner: true }
                });
            }

            if (role === Role.USER) {
                return await tx.user.findUniqueOrThrow({
                    where: { id: newUser.id },
                    include: { memberOf: true }
                });
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
                customerId: (user as any).customerId,
                qrCode: (user as any).qrCode,
                loyaltyPoints: (user as any).loyaltyPoints,
                owner: (user as any).owner,
                memberOf: (user as any).memberOf,
                phone: (user as any).phone,
                isApproved: user.role === Role.OWNER ? (user as any).owner?.isApproved : true,
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
            include: { owner: true, memberOf: true }
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
                customerId: (user as any).customerId,
                qrCode: (user as any).qrCode,
                loyaltyPoints: (user as any).loyaltyPoints,
                owner: (user as any).owner,
                memberOf: (user as any).memberOf,
                phone: (user as any).phone,
                isApproved: user.role === Role.OWNER ? (user as any).owner?.isApproved : true,
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
                printerIp: true,
                printerPort: true,
                phone: true,
                latitude: true,
                longitude: true,
                ownerId: true,
                customerId: true,
                qrCode: true,
                loyaltyPoints: true,
                owner: {
                    select: {
                        id: true,
                        name: true,
                        domain: true,
                        isApproved: true,
                    },
                },
                memberOf: {
                    select: {
                        id: true,
                        name: true,
                        domain: true,
                    }
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
        // Fetch current user data
        const currentUser = await prisma.user.findUnique({
            where: { id: userId },
            include: { owner: true }
        });

        if (!currentUser) {
            throw new Error('User not found');
        }

        const updateData: any = {};

        // Handle password change
        if (data.password) {
            // Verify current password
            if (!data.currentPassword) {
                throw new Error('Current password is required to change password');
            }

            if (!currentUser.password) {
                throw new Error('Cannot change password for OAuth users');
            }

            const isPasswordValid = await PasswordUtil.compare(data.currentPassword, currentUser.password);
            if (!isPasswordValid) {
                throw new Error('Current password is incorrect');
            }

            // Hash new password
            updateData.password = await PasswordUtil.hash(data.password);
        }

        // Handle email change
        if (data.email && data.email !== currentUser.email) {
            // Check if email is already taken
            const existingUser = await prisma.user.findUnique({
                where: { email: data.email }
            });

            if (existingUser) {
                throw new Error('Email already in use');
            }

            updateData.email = data.email;
        }

        // Handle other simple fields
        if (data.name) updateData.name = data.name;
        if (data.language) updateData.language = data.language;
        if (data.image !== undefined) updateData.image = data.image;
        if (data.printerIp !== undefined) updateData.printerIp = data.printerIp;
        if (data.printerPort !== undefined) updateData.printerPort = data.printerPort;
        if (data.phone !== undefined) updateData.phone = data.phone;
        if (data.latitude !== undefined) updateData.latitude = data.latitude;
        if (data.longitude !== undefined) updateData.longitude = data.longitude;

        // Handle Owner-specific fields (domain & storeName)
        if (currentUser.role === Role.OWNER && currentUser.owner) {
            if (data.domain && data.domain !== currentUser.owner.domain) {
                // Check if domain is already taken
                const existingOwner = await prisma.owner.findUnique({
                    where: { domain: data.domain }
                });

                if (existingOwner) {
                    throw new Error('Domain already taken');
                }

                // Update Owner table
                await prisma.owner.update({
                    where: { id: currentUser.owner.id },
                    data: { domain: data.domain }
                });
            }

            if (data.storeName) {
                // Update Owner table
                await prisma.owner.update({
                    where: { id: currentUser.owner.id },
                    data: { name: data.storeName }
                });
            }
        }

        // Update user
        const user = await prisma.user.update({
            where: { id: userId },
            data: updateData,
            include: {
                owner: true,
                memberOf: true
            }
        });

        return {
            status: 'success',
            message: 'Profile updated successfully',
            user,
        };
    }
}
