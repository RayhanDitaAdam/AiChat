function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; } import { OAuth2Client } from 'google-auth-library';
import axios from 'axios';
import { prisma } from '../../common/services/prisma.service.js';
import { JWTService } from '../../common/services/jwt.service.js';

import { Role, } from '../../common/types/auth.types.js';
import { PasswordUtil } from '../../common/utils/password.util.js';
import { EmailService } from '../../common/services/email.service.js';
import { LoyaltyEngine } from '../reward/loyalty.engine.js';
import crypto from 'crypto';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
console.log(`[AuthService] Initialized with GOOGLE_CLIENT_ID: ${GOOGLE_CLIENT_ID ? (GOOGLE_CLIENT_ID.substring(0, 5) + '...') : 'MISSING'}`);
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
                if (primaryEmail) email = primaryEmail.email;
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
                } else {
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
                    isBlocked: (user).isBlocked,
                    avatarVariant: user.avatarVariant,
                }
            };

        } catch (error) {
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

            if (!payload) throw new Error('Invalid Google token payload');

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
                } else {
                    // Do not auto-register new users via Google Login if they don't exist
                    throw new Error('Email tidak terdaftar. Silakan daftar terlebih dahulu atau tautkan akun Google di menu profil.');
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
                    isBlocked: (user).isBlocked,
                    avatarVariant: user.avatarVariant,
                },
            };
        } catch (error) {
            console.error('Google authentication error:', error);
            throw new Error(`Failed to authenticate with Google: ${error.message}`);
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
        const exists = await (prisma.user).findUnique({ where: { customerId } });
        if (exists) return this.generateCustomerId();

        return customerId;
    }

    /**
     * Generate 7-digit sequential owner code (0000001 format)
     */
    async generateOwnerCode() {
        const lastOwner = await (prisma.owner).findFirst({
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
        const role = (input.role) || Role.USER;

        // Generate 6-Digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 600000); // 10 minutes

        // Upsert UserPending (in case they register again with same email before verifying)
        await (prisma).userPending.upsert({
            where: { email: input.email },
            update: {
                password: hashedPassword,
                name: input.name,
                role: role,
                code: otp,
                expiresAt,
                metadata: {
                    phone: input.phone,
                    storeName: (input).storeName,
                    domain: input.domain,
                    ownerDomain: (input).ownerDomain
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
                    storeName: (input).storeName,
                    domain: input.domain,
                    ownerDomain: (input).ownerDomain
                }
            }
        });

        // Send Branded OTP via Email
        try {
            console.log(`[DEBUG] Generated Registration OTP for ${input.email}: ${otp}`);
            await EmailService.sendOTP(input.email, input.name || 'Bre', otp);
        } catch (error) {
            console.error('Failed to send verification email (SMTP might be down). OTP logged above.', error);
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
            include: { owner: true, memberOf: true, staffRole: true }
        });

        if (!user) {
            throw new Error('Invalid email or password');
        }

        // Check if user is locked out from too many failed login attempts
        /* Commented out temporarily as requested
        if (user.loginLockedUntil && user.loginLockedUntil > new Date()) {
            const remainingMinutes = Math.ceil((user.loginLockedUntil.getTime() - Date.now()) / 1000 / 60);
            const error: any = new Error(`Terlalu banyak percobaan login gagal. Coba lagi dalam ${remainingMinutes} menit.`);
            error.statusCode = 429; // Too Many Requests
            throw error;
        }
        */


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
            // Increment failed login attempts
            const newAttempts = (user.loginAttempts || 0) + 1;
            const updateData = { loginAttempts: newAttempts };

            /* Commented out temporarily as requested
            if (newAttempts >= 4) {
                // Random lockout between 5-20 minutes
                const randomMinutes = Math.floor(Math.random() * (20 - 5 + 1)) + 5;
                updateData.loginLockedUntil = new Date(Date.now() + randomMinutes * 60 * 1000);
            }

            await prisma.user.update({
                where: { id: user.id },
                data: updateData
            });

            if (newAttempts >= 4) {
                const error: any = new Error('Terlalu banyak percobaan login gagal. Akun dikunci untuk sementara.');
                error.statusCode = 429;
                throw error;
            }
            */

            const remaining = 4 - newAttempts;
            throw new Error(`Invalid email or password (${remaining} percobaan tersisa)`);

        }

        // Successful login - reset attempts
        if (user.loginAttempts > 0 || user.loginLockedUntil) {
            await prisma.user.update({
                where: { id: user.id },
                data: {
                    loginAttempts: 0,
                    loginLockedUntil: null
                }
            });
        }

        const payloadToken = {
            userId: user.id,
            email: user.email,
            role: user.role,
        };



        // For Super Admin, require key file upload
        if (user.role === 'SUPER_ADMIN') {
            return {
                status: 'requires_key_file',
                userId: user.id
            };
        }

        // 2FA is now MANDATORY for all email/password logins (all roles except Super Admin)
        // Generate verification code (6 digits) and send to email
        const correctCode = this.generateEmailCode();

        // Store code with 300-second (5 min) expiry and reset retry count
        const codeExpiry = new Date(Date.now() + 300 * 1000);
        await prisma.user.update({
            where: { id: user.id },
            data: {
                twoFactorCode: correctCode,
                twoFactorCodeExpiry: codeExpiry,
                twoFactorRetryCount: 0
            }
        });

        // Send 2FA email to user (wrap in try-catch to avoid hanging if SMTP is down)
        try {
            console.log(`[DEBUG] Generated OTP for ${user.email}: ${correctCode}`);
            await EmailService.send2FAEmail(
                user.email,
                user.name || 'User',
                correctCode
            );
        } catch (emailError) {
            console.error('Failed to send 2FA email (SMTP might be down). OTP logged above.', emailError);
            // We continue because the OTP is shown in logs for development
        }

        return {
            status: 'success',
            requires2FA: true,
            message: 'Verification code sent to email',
            userId: user.id
        };
    }

    /**
     * Verify Super Admin Key File
     */
    async verifyKeyFile(userId, keyContent) {
        const user = await prisma.user.findUnique({
            where: { id: userId, role: 'SUPER_ADMIN' },
            include: { owner: true, memberOf: true }
        });

        if (!user) {
            throw new Error('User not found or not a Super Admin');
        }

        if (!user.superAdminKeyHash) {
            throw new Error('Key file authentication is not configured for this admin');
        }

        console.log(`[DEBUG] Received keyContent length: ${_optionalChain([keyContent, 'optionalAccess', _ => _.length])}`);
        const cleanKey = keyContent.trim();
        console.log(`[DEBUG] Cleaned keyContent length: ${cleanKey.length}`);

        const isValid = await (await import('../../common/utils/password.util.js')).PasswordUtil.compare(cleanKey, user.superAdminKeyHash);

        console.log(`[DEBUG] Comparison result: ${isValid}`);

        if (!isValid) {
            throw new Error('Invalid key file content');
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
                isBlocked: (user).isBlocked,
                avatarVariant: user.avatarVariant,
            }
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
                memberOfId: true,
                googleId: true,
                githubId: true,
                owner: {
                    select: {
                        id: true,
                        name: true,
                        domain: true,
                        isApproved: true,
                        businessCategory: true,
                    },
                },
                memberOf: {
                    select: {
                        id: true,
                        name: true,
                        domain: true,
                    }
                },
                staffRole: true,
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
        if (data.name) updateData.name = data.name;
        if (data.language) updateData.language = data.language;
        if (data.image !== undefined) updateData.image = data.image;
        if (data.printerIp !== undefined) updateData.printerIp = data.printerIp;
        if (data.printerPort !== undefined) updateData.printerPort = data.printerPort;
        if (data.phone !== undefined) updateData.phone = data.phone;
        if (data.latitude !== undefined) updateData.latitude = data.latitude;
        if (data.longitude !== undefined) updateData.longitude = data.longitude;
        if (data.medicalRecord !== undefined) updateData.medicalRecord = data.medicalRecord;
        if (data.avatarVariant !== undefined) updateData.avatarVariant = data.avatarVariant;
        if (data.receiptWidth !== undefined) updateData.receiptWidth = data.receiptWidth;

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

        if ((user).isBlocked) {
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
        const pending = await (prisma).userPending.findUnique({
            where: { email }
        });

        if (!pending) {
            // Check if already in User table (maybe already verified)
            const alreadyVerified = await prisma.user.findUnique({ where: { email } });
            if (alreadyVerified) return { status: 'success', message: 'Email sudah terverifikasi' };

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

        const metadata = (pending.metadata) || {};

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
                isEmailVerified: true,
                disabledMenus: pending.role === Role.OWNER ? ['POS System'] : []
            };

            // Associate with store if applicable
            if (pending.role === Role.USER && metadata.ownerDomain) {
                const store = await tx.owner.findUnique({
                    where: { domain: metadata.ownerDomain }
                });
                if (store) userData.memberOfId = store.id;
            }

            const user = await tx.user.create({
                data: userData
            });

            // Award registration bonus if joining a store
            if (userData.memberOfId) {
                await LoyaltyEngine.awardRegistrationBonus(tx, user.id, userData.memberOfId);
            }

            // If OWNER, create Owner record
            if (pending.role === Role.OWNER) {
                if (!metadata.domain || !metadata.storeName) {
                    throw new Error('Data toko tidak lengkap');
                }

                // Check domain again just in case
                const existingOwner = await tx.owner.findUnique({
                    where: { domain: metadata.domain }
                });
                if (existingOwner) throw new Error('Domain toko sudah diambil');

                const ownerCode = await this.generateOwnerCode();
                const newOwner = await (tx.owner).create({
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
            await (tx).userPending.delete({
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

        // Award registration bonus
        await LoyaltyEngine.awardRegistrationBonus(prisma, userId, storeId);

        return {
            status: 'success',
            message: `Successfully joined ${store.name}`,
            user: updatedUser
        };
    }

    /**
     * Generate reset password token and send email
     */
    async forgotPassword(email) {
        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            // Error message should be generic to avoid email enumeration
            throw new Error('Jika email terdaftar, instruksi reset password akan dikirim.');
        }

        if (!user.password && (user.googleId || user.githubId)) {
            throw new Error('Akun ini menggunakan login sosial (Google/GitHub). Silakan login menggunakan metode tersebut.');
        }

        // Generate hex token
        const token = crypto.randomBytes(32).toString('hex');
        const expires = new Date(Date.now() + 3600000); // 1 hour

        await prisma.user.update({
            where: { id: user.id },
            data: {
                resetPasswordToken: token,
                resetPasswordExpires: expires
            }
        });

        const baseUrl = process.env.FRONTEND_URL || 'https://panggaleh.com';
        const resetLink = `${baseUrl}/reset-password?token=${token}`;

        try {
            await EmailService.sendResetPasswordLink(email, user.name || 'User', resetLink);
        } catch (error) {
            console.error('Failed to send reset email:', error);
            throw new Error('Gagal mengirim email reset password. Silakan coba lagi nanti.');
        }

        return {
            status: 'success',
            message: 'Instruksi reset password telah dikirim ke email Anda.'
        };
    }

    /**
     * Validate reset password token without resetting password
     */
    async validateResetToken(token) {
        // Reject tokens that are not exactly 64 hex characters
        if (!/^[a-f0-9]{64}$/.test(token)) {
            throw new Error('Token reset password tidak valid atau sudah kedaluwarsa.');
        }

        const user = await prisma.user.findFirst({
            where: {
                resetPasswordToken: token,
                resetPasswordExpires: { gt: new Date() }
            },
            select: { id: true }
        });

        if (!user) {
            throw new Error('Token reset password tidak valid atau sudah kedaluwarsa.');
        }

        return { status: 'success', valid: true };
    }

    /**
     * Reset password using token
     */
    async resetPassword(input) {
        // Defense-in-depth: token must be exactly 64 lowercase hex characters
        if (!/^[a-f0-9]{64}$/.test(input.token)) {
            throw new Error('Token reset password tidak valid atau sudah kedaluwarsa.');
        }

        const user = await prisma.user.findFirst({
            where: {
                resetPasswordToken: input.token,
                resetPasswordExpires: { gt: new Date() }
            }
        });

        if (!user) {
            throw new Error('Token reset password tidak valid atau sudah kedaluwarsa.');
        }

        // Check if user is locked out
        if (user.resetPasswordLockedUntil && user.resetPasswordLockedUntil > new Date()) {
            const remainingMinutes = Math.ceil((user.resetPasswordLockedUntil.getTime() - Date.now()) / 1000 / 60);
            const error = new Error(`Terlalu banyak percobaan gagal. Coba lagi dalam ${remainingMinutes} menit.`);
            error.statusCode = 429; // Too Many Requests
            throw error;
        }

        // Validate password strength first (without incrementing attempts)
        const passwordValidation = PasswordUtil.validateStrength(input.password);
        if (!passwordValidation.valid) {
            throw new Error(passwordValidation.message || 'Password tidak memenuhi kriteria keamanan.');
        }

        // Verify the new password is different from old one (if old exists)
        // This is where we increment attempts on WRONG password
        let passwordMatches = false;
        if (user.password) {
            passwordMatches = await PasswordUtil.compare(input.password, user.password);
            if (passwordMatches) {
                throw new Error('Password baru tidak boleh sama dengan password lama.');
            }
        }

        // Hash and update password
        const hashedPassword = await PasswordUtil.hash(input.password);

        await prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                resetPasswordToken: null,
                resetPasswordExpires: null,
                resetPasswordAttempts: 0,
                resetPasswordLockedUntil: null
            }
        });

        return {
            status: 'success',
            message: 'Password Anda telah berhasil diperbarui. Silakan login dengan password baru.'
        };
    }

    /**
     * Generate random 2-digit code for email 2FA
     */
    generateEmailCode() {
        return Math.floor(100000 + Math.random() * 900000).toString(); // 6 digits
    }

    /**
     * Generate 2 decoy codes different from the correct code
     */
    generateDecoyCodes(correctCode) {
        const decoys = [];
        while (decoys.length < 2) {
            const code = this.generateEmailCode();
            if (code !== correctCode && !decoys.includes(code)) {
                decoys.push(code);
            }
        }
        return [decoys[0], decoys[1]];
    }

    /**
     * POST /api/auth/2fa/setup - Enable 2FA for user
     */
    async enable2FA(userId) {
        await prisma.user.update({
            where: { id: userId },
            data: { twoFactorEnabled: true }
        });

        return {
            status: 'success',
            message: '2FA enabled. You will receive verification codes via email on login.'
        };
    }

    /**
     * Disable 2FA for user
     */
    async disable2FA(userId) {
        await prisma.user.update({
            where: { id: userId },
            data: {
                twoFactorEnabled: false,
                twoFactorCode: null,
                twoFactorCodeExpiry: null
            }
        });

        return {
            status: 'success',
            message: 'Two-factor authentication disabled'
        };
    }



    /**
     * Completes the 2FA login by verifying the email code
     */
    async login2FA(userId, code) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { owner: true, staffRole: true }
        });

        if (!user) throw new Error('User not found');

        console.log(`[Login2FA] Verifying user ${user.email}`);
        console.log(`[Login2FA] Received code: '${code}'`);
        console.log(`[Login2FA] Stored code: '${user.twoFactorCode}'`);
        console.log(`[Login2FA] Expiry: ${user.twoFactorCodeExpiry}`);
        console.log(`[Login2FA] Now: ${new Date()}`);

        // Check code
        if (!user.twoFactorCode || user.twoFactorCode !== code) {
            console.log('[Login2FA] Code mismatch');

            // Increment retry count
            const updatedUser = await prisma.user.update({
                where: { id: userId },
                data: { twoFactorRetryCount: { increment: 1 } },
                select: { twoFactorRetryCount: true }
            });

            if (updatedUser.twoFactorRetryCount >= 3) {
                await prisma.user.update({
                    where: { id: userId },
                    data: { twoFactorCode: null, twoFactorCodeExpiry: null, twoFactorRetryCount: 0 }
                });
                throw new Error('Too many failed attempts. Please login again.');
            }

            throw new Error(`Invalid verification code. ${3 - updatedUser.twoFactorRetryCount} attempts remaining.`);
        }

        // Check expiry
        if (user.twoFactorCodeExpiry && new Date() > user.twoFactorCodeExpiry) {
            console.log('[Login2FA] Code expired');
            throw new Error('Verification code expired');
        }

        // Clear code
        await prisma.user.update({
            where: { id: userId },
            data: { twoFactorCode: null, twoFactorCodeExpiry: null }
        });

        const payload = {
            userId: user.id,
            email: user.email,
            role: user.role,
            ...(user.ownerId && { ownerId: user.ownerId }),
        };

        const accessToken = JWTService.generateToken(payload);
        const refreshToken = JWTService.generateRefreshToken(payload);

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
                customerId: (user).customerId,
                qrCode: (user).qrCode,
                loyaltyPoints: (user).loyaltyPoints,
                owner: {
                    ...user.owner,
                    businessCategory: _optionalChain([(user.owner), 'optionalAccess', _2 => _2.businessCategory])
                },
                memberOf: (user).memberOf,
                staffRole: (user).staffRole,
                phone: (user).phone,
                disabledMenus: (user).disabledMenus,
                isBlocked: (user).isBlocked,
                avatarVariant: user.avatarVariant,
                isApproved: user.role === Role.OWNER ? _optionalChain([(user), 'access', _3 => _3.owner, 'optionalAccess', _4 => _4.isApproved]) : true,
            }
        };
    }

    /**
     * Resends the 2FA verification code to user email
     */
    async resend2FA(userId) {
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) throw new Error('User not found');

        const correctCode = this.generateEmailCode();
        const codeExpiry = new Date(Date.now() + 300 * 1000); // 5 minutes

        await prisma.user.update({
            where: { id: user.id },
            data: {
                twoFactorCode: correctCode,
                twoFactorCodeExpiry: codeExpiry,
                twoFactorRetryCount: 0
            }
        });

        try {
            console.log(`[DEBUG] Resent OTP for ${user.email}: ${correctCode}`);
            await EmailService.send2FAEmail(
                user.email,
                user.name || 'User',
                correctCode
            );
        } catch (emailError) {
            console.error('Failed to resend 2FA email (SMTP might be down). OTP logged above.', emailError);
        }

        return {
            status: 'success',
            message: 'Verification code resent successfully'
        };
    }

    /**
     * Link Google account to an existing user
     */
    async linkGoogleAccount(userId, token) {
        try {
            const ticket = await googleClient.verifyIdToken({
                idToken: token,
                audience: GOOGLE_CLIENT_ID,
            });

            const payload = ticket.getPayload();
            if (!payload) throw new Error('Invalid Google token payload');

            // Check if this googleId is already linked to ANOTHER user
            const existingLink = await prisma.user.findUnique({
                where: { googleId: payload.sub }
            });

            if (existingLink && existingLink.id !== userId) {
                throw new Error('Akun Google ini sudah tertaut dengan akun lain.');
            }

            // Link to the current user
            await prisma.user.update({
                where: { id: userId },
                data: { googleId: payload.sub }
            });

            // Return the full user profile to keep frontend state complete
            const profileResponse = await this.getUserProfile(userId);

            return {
                status: 'success',
                message: 'Akun Google berhasil ditautkan.',
                user: profileResponse.user
            };
        } catch (error) {
            console.error('Link Google Error:', error);
            throw new Error(error instanceof Error ? error.message : 'Gagal menautkan akun Google');
        }
    }

    /**
     * Unlink/Unbind Google account from an existing user
     */
    async unlinkGoogleAccount(userId) {
        try {
            const user = await prisma.user.findUnique({
                where: { id: userId }
            });

            if (!user) throw new Error('User not found');
            if (!user.googleId) throw new Error('Akun Google belum ditautkan.');

            // Check if user has a password. If not, they MUST NOT unlink Google because they won't be able to login
            if (!user.password && !user.githubId) {
                throw new Error('Anda tidak dapat melepas tautan Google karena akun ini tidak memiliki password atau metode login lain. Silakan buat password terlebih dahulu.');
            }

            await prisma.user.update({
                where: { id: userId },
                data: { googleId: null }
            });

            const profileResponse = await this.getUserProfile(userId);

            return {
                status: 'success',
                message: 'Tautan Akun Google berhasil dilepas.',
                user: profileResponse.user
            };
        } catch (error) {
            console.error('Unlink Google Error:', error);
            throw new Error(error instanceof Error ? error.message : 'Gagal melepas tautan akun Google');
        }
    }
}
