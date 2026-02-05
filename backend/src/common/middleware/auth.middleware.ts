import type { Request, Response, NextFunction } from 'express';
import { JWTService } from '../services/jwt.service.js';
import { prisma } from '../services/prisma.service.js';

/**
 * Middleware to authenticate users via JWT token
 * Adds user data to req.user if token is valid
 */
export async function authenticate(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({
                status: 'error',
                message: 'Authentication required. Please provide a valid token.'
            });
            return;
        }

        const token = authHeader.substring(7); // Remove 'Bearer ' prefix
        const payload = JWTService.verifyToken(token);

        if (!payload) {
            res.status(401).json({
                status: 'error',
                message: 'Invalid or expired token.'
            });
            return;
        }

        // Fetch full user data from database
        const user = await prisma.user.findUnique({
            where: { id: payload.userId },
            select: {
                id: true,
                email: true,
                name: true,
                image: true,
                role: true,
                ownerId: true,
                memberOfId: true,
            },
        });

        if (!user) {
            res.status(401).json({
                status: 'error',
                message: 'User not found.'
            });
            return;
        }

        // Attach user to request
        req.user = user;
        next();
    } catch (error) {
        console.error('Authentication error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Authentication failed.'
        });
    }
}
