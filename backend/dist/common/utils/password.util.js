import * as argon2 from 'argon2';
export class PasswordUtil {
    /**
     * Hash a plain password using Argon2
     */
    static async hash(password) {
        return argon2.hash(password);
    }
    /**
     * Compare plain password with hashed password
     */
    static async compare(password, hashedPassword) {
        try {
            return await argon2.verify(hashedPassword, password);
        }
        catch (error) {
            return false;
        }
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