import bcrypt from 'bcryptjs';
const SALT_ROUNDS = 10;
export class PasswordUtil {
    /**
     * Hash a plain password
     */
    static async hash(password) {
        return bcrypt.hash(password, SALT_ROUNDS);
    }
    /**
     * Compare plain password with hashed password
     */
    static async compare(password, hashedPassword) {
        return bcrypt.compare(password, hashedPassword);
    }
    /**
     * Validate password strength
     */
    static validateStrength(password) {
        if (password.length < 8) {
            return { valid: false, message: 'Password must be at least 8 characters long' };
        }
        if (!/[A-Z]/.test(password)) {
            return { valid: false, message: 'Password must contain at least one uppercase letter' };
        }
        if (!/[a-z]/.test(password)) {
            return { valid: false, message: 'Password must contain at least one lowercase letter' };
        }
        if (!/[0-9]/.test(password)) {
            return { valid: false, message: 'Password must contain at least one number' };
        }
        return { valid: true };
    }
}
//# sourceMappingURL=password.util.js.map