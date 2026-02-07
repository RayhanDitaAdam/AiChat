import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

export const generateToken = (payload: any) => {
    return jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
};

export const verifyToken = (token: string) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET || 'secret') as any;
    } catch (error) {
        return null;
    }
};

export const hashPassword = async (password: string) => {
    return await bcrypt.hash(password, 10);
};

export const comparePassword = async (password: string, hash: string) => {
    return await bcrypt.compare(password, hash);
};
