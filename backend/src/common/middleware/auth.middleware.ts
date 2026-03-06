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
        let token = '';

        if (req.cookies && req.cookies.accessToken) {
            token = req.cookies.accessToken; // Prioritize HttpOnly Cookie
        } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
            token = req.headers.authorization.substring(7); // Remove 'Bearer ' prefix
        }

        if (!token) {
            res.status(401).json({
                status: 'error',
                message: 'Authentication required. Please provide a valid token in Cookie or Bearer header.'
            });
            return;
        }

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

/**
 * Middleware to optionally authenticate users
 * If token is valid, req.user is populated.
 * If token is missing or invalid, req.user is undefined but request proceeds.
 */
export async function authenticateOptional(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        let token = '';

        if (req.cookies && req.cookies.accessToken) {
            token = req.cookies.accessToken;
        } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
            token = req.headers.authorization.substring(7);
        }

        if (!token) {
            // No token, proceed as guest
            next();
            return;
        }

        const payload = JWTService.verifyToken(token);

        if (payload) {
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

            if (user) {
                req.user = user;
            }
        }

        next();
    } catch (error) {
        // On error, just proceed as guest
        next();
    }
}
