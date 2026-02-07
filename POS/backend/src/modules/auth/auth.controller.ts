import { Request, Response } from 'express';
import * as authService from './auth.service.js';
import { AuthRequest } from '../../middleware/auth.middleware.js';

export const register = async (req: Request, res: Response) => {
    try {
        const existingUser = await authService.findUserByEmail(req.body.email);
        if (existingUser) {
            return res.status(400).json({ status: 'error', message: 'Email already taken' });
        }

        const data = await authService.register(req.body);
        res.status(201).json({ status: 'success', data });
    } catch (error: any) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        const data = await authService.login(email, password);
        res.status(200).json({ status: 'success', data });
    } catch (error: any) {
        const statusCode = error.message === 'Invalid credentials' ? 401 : 500;
        res.status(statusCode).json({ status: 'error', message: error.message });
    }
};

export const getMe = async (req: AuthRequest, res: Response) => {
    res.status(200).json({
        status: 'success',
        data: { user: req.user }
    });
};
