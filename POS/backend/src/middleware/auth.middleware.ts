import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/auth.js';
import prisma from '../prisma.js';

export interface AuthRequest extends Request {
    user?: {
        id: string;
        email: string;
        username: string | null;
        role: string;
        name: string | null;
    };
}

export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ status: 'error', message: 'Unauthorized: No token provided' });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
        return res.status(401).json({ status: 'error', message: 'Unauthorized: Invalid or expired token' });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: (decoded as any).id },
            select: { id: true, email: true, username: true, role: true, name: true }
        });

        if (!user) {
            return res.status(401).json({ status: 'error', message: 'Unauthorized: User not found' });
        }

        req.user = user as any;
        next();
    } catch (error) {
        return res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
};

export const roleMiddleware = (roles: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ status: 'error', message: 'Forbidden: Insufficient permissions' });
        }
        next();
    };
};
