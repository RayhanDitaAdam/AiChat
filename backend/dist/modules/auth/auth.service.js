import { OAuth2Client } from 'google-auth-library';
import axios from 'axios';
import { prisma } from '../../common/services/prisma.service.js';
import { JWTService } from '../../common/services/jwt.service.js';
import { Role } from '../../common/types/auth.types.js';
import { PasswordUtil } from '../../common/utils/password.util.js';
import { EmailService } from '../../common/services/email.service.js';
import crypto from 'crypto';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);
export class AuthService {
    /**
     * Verify GitHub code and create/update user
     */
    async authenticateWithGitHub(code) {
        try {
            // 1. Exchange code for access token
            const tokenResponse = await axios.post('https://github.com/login/oauth/access_token', {
                client_id: process.env.GITHUB_CLIENT_ID,
                client_secret: process.env.GITHUB_CLIENT_SECRET,
                code,
            }, {
                headers: { Accept: 'application/json' }
            });
            const { access_token, error } = tokenResponse.data;
            if (error || !access_token) {
                throw new Error(error || 'Failed to obtain access token from GitHub');
            }
            // 2. Get User Profile
            const userResponse = await axios.get('https://api.github.com/user', {
                headers: { Authorization: `Bearer ${access_token}` }
            });
            const githubUser = userResponse.data;
            let email = githubUser.email;
            // 3. If email is private, fetch it
            if (!email) {
                const emailsResponse = await axios.get('https://api.github.com/user/emails', {
                    headers: { Authorization: `Bearer ${access_token}` }
                });
                const primaryEmail = emailsResponse.data.find((e) => e.primary && e.verified);
                if (primaryEmail)
                    email = primaryEmail.email;
            }
            if (!email) {
                throw new Error('GitHub account must have a verified email');
            }
            // 4. Find or Create User
            let user = await prisma.user.findUnique({
                where: { githubId: githubUser.id.toString() } // GitHub ID is number, store as string
            });
            if (!user) {
                // Check if user exists with this email
                user = await prisma.user.findUnique({
                    where: { email }
                });
                if (user) {
                    // Block OWNER (optional, keeping consistent with Google logic)
                    if (user.role === Role.OWNER) {
                        throw new Error('Akun Owner tidak diperbolehkan login via GitHub. Silakan gunakan Email & Password.');
                    }
                    // Link GitHub account
                    user = await prisma.user.update({
                        where: { id: user.id },
                        data: {
                            githubId: githubUser.id.toString(),
                            name: githubUser.name || user.name,
                            image: githubUser.avatar_url || user.image,
                        }
                    });
                }
                else {
                    // Create new User
                    user = await prisma.user.create({
                        data: {
                            email: email,
                            githubId: githubUser.id.toString(),
                            name: githubUser.name || githubUser.login,
                            image: githubUser.avatar_url,
                            role: Role.USER,
                            isEmailVerified: true // GitHub verifies emails
                        }
                    });
                }
            }
            // 5. Generate Tokens
            const payloadToken = {
                userId: user.id,
                email: user.email,
                role: user.role,
            };
            const accessToken = JWTService.generateToken(payloadToken);
            const refreshToken = JWTService.generateRefreshToken(payloadToken);
            return {
                status: 'success',
                token: accessToken,
                refreshToken,
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    image: user.image,
                    role: user.role,
                    ownerId: user.ownerId,
                    phone: user.phone,
                    disabledMenus: user.disabledMenus,
                    isBlocked: user.isBlocked,
                    avatarVariant: user.avatarVariant,
                }
            };
        }
        catch (error) {
            console.error('GitHub Auth Error:', error);
            throw new Error('Failed to authenticate with GitHub');
        }
    }
    /**
     * Verify Google token and create/update user
     */
    async authenticateWithGoogle(input) {
        try {
            // Verify Google token
            const ticket = await googleClient.verifyIdToken({
                idToken: input.token,
                audience: GOOGLE_CLIENT_ID,
            });
            const payload = ticket.getPayload();
            if (!payload)
                throw new Error('Invalid Google token payload');
            // 1. Verify Audience (handled by library but explicit check requested)
            if (payload.aud !== GOOGLE_CLIENT_ID) {
                throw new Error('Invalid token audience');
            }
            // 2. Verify Issuer
            if (payload.iss !== 'accounts.google.com' && payload.iss !== 'https://accounts.google.com') {
                throw new Error('Invalid token issuer');
            }
            // 3. Verify Email Verified status
            if (!payload.email_verified) {
                throw new Error('Google email not verified');
            }
            if (!payload.email || !payload.sub) {
                throw new Error('Incomplete token payload');
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
                    // Block OWNER from using Google Login
                    if (user.role === Role.OWNER) {
                        throw new Error('Akun Owner tidak diperbolehkan login via Google. Silakan gunakan Email & Password.');
                    }
                    // Link google account to existing user
                    user = await prisma.user.update({
                        where: { id: user.id },
                        data: {
                            googleId: payload.sub,
                            name: payload.name || user.name,
                            image: payload.picture || user.image,
                        },
                    });
                }
                else {
                    // Create new user
                    user = await prisma.user.create({
                        data: {
                            email: payload.email,
                            googleId: payload.sub,
                            name: payload.name || null,
                            image: payload.picture || null,
                            role: Role.USER, // Default role
                            isEmailVerified: true
                        },
                    });
                }
            }
            const payloadToken = {
                userId: user.id,
                email: user.email,
                role: user.role,
            };
            const accessToken = JWTService.generateToken(payloadToken);
            const refreshToken = JWTService.generateRefreshToken(payloadToken);
            return {
                status: 'success',
                token: accessToken,
                refreshToken: refreshToken,
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    image: user.image,
                    role: user.role,
                    ownerId: user.ownerId,
                    phone: user.phone,
                    disabledMenus: user.disabledMenus,
                    isBlocked: user.isBlocked,
                    avatarVariant: user.avatarVariant,
                },
            };
        }
        catch (error) {
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
    async generateCustomerId() {
        const randomDigits = Math.floor(1000000 + Math.random() * 9000000).toString();
        const customerId = `CUST-${randomDigits}`;
        // Ensure uniqueness
        const exists = await prisma.user.findUnique({ where: { customerId } });
        if (exists)
            return this.generateCustomerId();
        return customerId;
    }
    /**
     * Generate 7-digit sequential owner code (0000001 format)
     */
    async generateOwnerCode() {
        const lastOwner = await prisma.owner.findFirst({
            orderBy: { ownerCode: 'desc' },
            where: { ownerCode: { not: null } }
        });
        let nextNumber = 1;
        if (lastOwner && lastOwner.ownerCode) {
            nextNumber = parseInt(lastOwner.ownerCode, 10) + 1;
        }
        return nextNumber.toString().padStart(7, '0');
    }
    /**
     * Register new user with email and password
     */
    async register(input) {
        // Validate password strength
        const passwordValidation = PasswordUtil.validateStrength(input.password);
        if (!passwordValidation.valid) {
            throw new Error(passwordValidation.message || 'Invalid password');
        }
        // Check if user already exists in main User table
        const existingUser = await prisma.user.findUnique({
            where: { email: input.email },
        });
        if (existingUser) {
            throw new Error('User with this email already exists');
        }
        // Hash password
        const hashedPassword = await PasswordUtil.hash(input.password);
        const role = input.role || Role.USER;
        // Generate 6-Digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 600000); // 10 minutes
        // Upsert UserPending (in case they register again with same email before verifying)
        await prisma.userPending.upsert({
            where: { email: input.email },
            update: {
                password: hashedPassword,
                name: input.name,
                role: role,
                code: otp,
                expiresAt,
                metadata: {
                    phone: input.phone,
                    storeName: input.storeName,
                    domain: input.domain,
                    ownerDomain: input.ownerDomain
                }
            },
            create: {
                email: input.email,
                password: hashedPassword,
                name: input.name,
                role: role,
                code: otp,
                expiresAt,
                metadata: {
                    phone: input.phone,
                    storeName: input.storeName,
                    domain: input.domain,
                    ownerDomain: input.ownerDomain
                }
            }
        });
        // Send Branded OTP via Email
        try {
            await EmailService.sendOTP(input.email, input.name || 'Bre', otp);
        }
        catch (error) {
            console.error('Failed to send verification email:', error);
        }
        return {
            status: 'success',
            requiresVerification: true,
            email: input.email
        };
    }
    /**
     * Login with email and password
     */
    async login(input) {
        // Find user by email
        const user = await prisma.user.findUnique({
            where: { email: input.email },
            include: { owner: true, memberOf: true }
        });
        if (!user) {
            throw new Error('Invalid email or password');
        }
        // Check if email is verified
        if (!user.isEmailVerified) {
            // Re-send OTP if needed? For now just throw error
            throw new Error('Email belum diverifikasi. Silakan cek inbox Anda.');
        }
        // Verify password
        if (!user.password) {
            throw new Error('Akun ini didaftarkan melalui Google. Silakan login menggunakan Google.');
        }
        const isPasswordValid = await PasswordUtil.compare(input.password, user.password);
        if (!isPasswordValid) {
            throw new Error('Invalid email or password');
        }
        const payloadToken = {
            userId: user.id,
            email: user.email,
            role: user.role,
        };
        const accessToken = JWTService.generateToken(payloadToken);
        const refreshToken = JWTService.generateRefreshToken(payloadToken);
        return {
            status: 'success',
            message: 'Login successful',
            token: accessToken,
            refreshToken: refreshToken,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                image: user.image,
                role: user.role,
                ownerId: user.ownerId,
                customerId: user.customerId,
                qrCode: user.qrCode,
                loyaltyPoints: user.loyaltyPoints,
                owner: user.owner,
                memberOf: user.memberOf,
                phone: user.phone,
                disabledMenus: user.disabledMenus,
                isBlocked: user.isBlocked,
                avatarVariant: user.avatarVariant,
                isApproved: user.role === Role.OWNER ? user.owner?.isApproved : true,
            },
        };
    }
    /**
     * Get user profile from database
     */
    async getUserProfile(userId) {
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
                disabledMenus: true,
                isBlocked: true,
                medicalRecord: true,
                ownerId: true,
                customerId: true,
                qrCode: true,
                loyaltyPoints: true,
                avatarVariant: true,
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
            },
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
    async updateProfile(userId, data) {
        // Fetch current user data
        const currentUser = await prisma.user.findUnique({
            where: { id: userId },
            include: { owner: true }
        });
        if (!currentUser) {
            throw new Error('User not found');
        }
        const updateData = {};
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
        if (data.name)
            updateData.name = data.name;
        if (data.language)
            updateData.language = data.language;
        if (data.image !== undefined)
            updateData.image = data.image;
        if (data.printerIp !== undefined)
            updateData.printerIp = data.printerIp;
        if (data.printerPort !== undefined)
            updateData.printerPort = data.printerPort;
        if (data.phone !== undefined)
            updateData.phone = data.phone;
        if (data.latitude !== undefined)
            updateData.latitude = data.latitude;
        if (data.longitude !== undefined)
            updateData.longitude = data.longitude;
        if (data.medicalRecord !== undefined)
            updateData.medicalRecord = data.medicalRecord;
        if (data.avatarVariant !== undefined)
            updateData.avatarVariant = data.avatarVariant;
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
    /**
     * Refresh tokens using a refresh token
     */
    async refreshTokens(refreshToken) {
        const payload = JWTService.verifyRefreshToken(refreshToken);
        if (!payload) {
            throw new Error('Invalid or expired refresh token');
        }
        // Check if user still exists and is not blocked
        const user = await prisma.user.findUnique({
            where: { id: payload.userId },
        });
        if (!user) {
            throw new Error('User no longer exists');
        }
        if (user.isBlocked) {
            throw new Error('User account is blocked');
        }
        const newPayload = {
            userId: user.id,
            email: user.email,
            role: user.role,
        };
        const newAccessToken = JWTService.generateToken(newPayload);
        const newRefreshToken = JWTService.generateRefreshToken(newPayload);
        return {
            status: 'success',
            token: newAccessToken,
            refreshToken: newRefreshToken,
        };
    }
    async verifyEmail(email, code) {
        // Find in UserPending
        const pending = await prisma.userPending.findUnique({
            where: { email }
        });
        if (!pending) {
            // Check if already in User table (maybe already verified)
            const alreadyVerified = await prisma.user.findUnique({ where: { email } });
            if (alreadyVerified)
                return { status: 'success', message: 'Email sudah terverifikasi' };
            throw new Error('Data registrasi tidak ditemukan. Silakan daftar ulang.');
        }
        // Check OTP
        if (pending.code !== code) {
            throw new Error('Kode verifikasi tidak valid');
        }
        // Check expiry
        if (pending.expiresAt < new Date()) {
            throw new Error('Kode verifikasi sudah kedaluwarsa. Silakan daftar ulang.');
        }
        const metadata = pending.metadata || {};
        // Start transaction to move to User table
        await prisma.$transaction(async (tx) => {
            const customerId = await this.generateCustomerId();
            const userData = {
                email: pending.email,
                password: pending.password,
                name: pending.name,
                role: pending.role,
                phone: metadata.phone,
                customerId,
                qrCode: customerId,
                isEmailVerified: true
            };
            // Associate with store if applicable
            if (pending.role === Role.USER && metadata.ownerDomain) {
                const store = await tx.owner.findUnique({
                    where: { domain: metadata.ownerDomain }
                });
                if (store)
                    userData.memberOfId = store.id;
            }
            const user = await tx.user.create({
                data: userData
            });
            // If OWNER, create Owner record
            if (pending.role === Role.OWNER) {
                if (!metadata.domain || !metadata.storeName) {
                    throw new Error('Data toko tidak lengkap');
                }
                // Check domain again just in case
                const existingOwner = await tx.owner.findUnique({
                    where: { domain: metadata.domain }
                });
                if (existingOwner)
                    throw new Error('Domain toko sudah diambil');
                const ownerCode = await this.generateOwnerCode();
                const newOwner = await tx.owner.create({
                    data: {
                        ownerCode,
                        name: metadata.storeName,
                        domain: metadata.domain,
                        user: { connect: { id: user.id } }
                    }
                });
                await tx.user.update({
                    where: { id: user.id },
                    data: { ownerId: newOwner.id }
                });
            }
            // Delete pending record
            await tx.userPending.delete({
                where: { email: pending.email }
            });
        });
        return { status: 'success', message: 'Verifikasi berhasil. Sekarang Anda bisa login.' };
    }
    /**
     * Get list of public stores (Approved owners)
     */
    async getPublicStores() {
        const stores = await prisma.owner.findMany({
            where: { isApproved: true },
            select: {
                id: true,
                name: true,
                domain: true,
                address: true,
                latitude: true,
                longitude: true
            },
            orderBy: { name: 'asc' }
        });
        return {
            status: 'success',
            stores
        };
    }
    /**
     * Join a store (One-time assignment for new OAuth users)
     */
    async joinStore(userId, storeId) {
        // 1. Check if user exists
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });
        if (!user) {
            throw new Error('User not found');
        }
        // 2. Check if user is already a member of a store
        if (user.memberOfId) {
            throw new Error('User is already assigned to a store. Contact support to change.');
        }
        // 3. Check if store exists
        const store = await prisma.owner.findUnique({
            where: { id: storeId }
        });
        if (!store) {
            throw new Error('Store not found');
        }
        // 4. Update user
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { memberOfId: storeId },
            include: {
                memberOf: {
                    select: {
                        id: true,
                        name: true,
                        domain: true
                    }
                }
            }
        });
        return {
            status: 'success',
            message: `Successfully joined ${store.name}`,
            user: updatedUser
        };
    }
}
//# sourceMappingURL=auth.service.js.map