import jwt from 'jsonwebtoken';
import type { JWTPayload } from '../types/auth.types.js';

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-change-this';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'refresh-secret-change-this';
const JWT_ACCESS_EXPIRES_IN = '1h'; // Short lived
const JWT_REFRESH_EXPIRES_IN = '7d'; // Long lived

export class JWTService {
    static generateToken(payload: JWTPayload): string {
        return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_ACCESS_EXPIRES_IN });
    }

    static generateRefreshToken(payload: JWTPayload): string {
        return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: JWT_REFRESH_EXPIRES_IN });
    }

    static generateTempToken(payload: JWTPayload): string {
        return jwt.sign(payload, JWT_SECRET, { expiresIn: '10m' }); // Short lived for 2FA polling
    }

    static verifyToken(token: string): JWTPayload | null {
        try {
            const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
            return decoded;
        } catch (error) {
            return null;
        }
    }

    static verifyRefreshToken(token: string): JWTPayload | null {
        try {
            const decoded = jwt.verify(token, JWT_REFRESH_SECRET) as JWTPayload;
            return decoded;
        } catch (error) {
            return null;
        }
    }

    static decodeToken(token: string): JWTPayload | null {
        try {
            return jwt.decode(token) as JWTPayload;
        } catch (error) {
            return null;
        }
    }
}
