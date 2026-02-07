import prisma from '../../prisma.js';
import { hashPassword, comparePassword, generateToken } from '../../utils/auth.js';

export const findUserByEmail = async (email: string) => {
    return await prisma.user.findUnique({ where: { email } });
};

export const register = async (data: any) => {
    const { email, password, name, role, phone, dob, username } = data;

    const hashedPassword = await hashPassword(password);

    // Map POS roles to AiChat roles
    let finalRole: 'USER' | 'STAFF' | 'ADMIN' = 'USER';
    if (role === 'CASHIER' || role === 'STAFF') finalRole = 'STAFF';
    else if (role === 'ADMIN') finalRole = 'ADMIN';

    const user = await prisma.user.create({
        data: {
            email,
            username: username || email.split('@')[0],
            password: hashedPassword,
            name,
            role: finalRole,
            phone,
            dob: dob ? new Date(dob) : null,
            isEmailVerified: true // Auto-verify for POS for now
        }
    });

    const token = generateToken({ id: user.id, email: user.email, role: user.role });
    return {
        token,
        user: {
            id: user.id,
            email: user.email,
            username: user.username,
            name: user.name,
            role: user.role
        }
    };
};

export const login = async (email: string, password: string) => {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.password) throw new Error('Invalid credentials');

    const isValid = await comparePassword(password, user.password);
    if (!isValid) throw new Error('Invalid credentials');

    const token = generateToken({ id: user.id, email: user.email, role: user.role });
    return {
        token,
        user: {
            id: user.id,
            email: user.email,
            username: user.username,
            name: user.name,
            role: user.role
        }
    };
};
