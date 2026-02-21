import type { JWTPayload } from '../types/auth.types.js';
export declare class JWTService {
    static generateToken(payload: JWTPayload): string;
    static generateRefreshToken(payload: JWTPayload): string;
    static generateTempToken(payload: JWTPayload): string;
    static verifyToken(token: string): JWTPayload | null;
    static verifyRefreshToken(token: string): JWTPayload | null;
    static decodeToken(token: string): JWTPayload | null;
}
//# sourceMappingURL=jwt.service.d.ts.map