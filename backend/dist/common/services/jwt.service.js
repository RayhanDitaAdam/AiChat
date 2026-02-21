import jwt from 'jsonwebtoken';
const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-change-this';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'refresh-secret-change-this';
const JWT_ACCESS_EXPIRES_IN = '1h'; // Short lived
const JWT_REFRESH_EXPIRES_IN = '7d'; // Long lived
export class JWTService {
    static generateToken(payload) {
        return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_ACCESS_EXPIRES_IN });
    }
    static generateRefreshToken(payload) {
        return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: JWT_REFRESH_EXPIRES_IN });
    }
    static generateTempToken(payload) {
        return jwt.sign(payload, JWT_SECRET, { expiresIn: '10m' }); // Short lived for 2FA polling
    }
    static verifyToken(token) {
        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            return decoded;
        }
        catch (error) {
            return null;
        }
    }
    static verifyRefreshToken(token) {
        try {
            const decoded = jwt.verify(token, JWT_REFRESH_SECRET);
            return decoded;
        }
        catch (error) {
            return null;
        }
    }
    static decodeToken(token) {
        try {
            return jwt.decode(token);
        }
        catch (error) {
            return null;
        }
    }
}
//# sourceMappingURL=jwt.service.js.map