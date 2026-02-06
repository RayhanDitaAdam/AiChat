export declare class PasswordUtil {
    /**
     * Hash a plain password
     */
    static hash(password: string): Promise<string>;
    /**
     * Compare plain password with hashed password
     */
    static compare(password: string, hashedPassword: string): Promise<boolean>;
    /**
     * Validate password strength
     */
    static validateStrength(password: string): {
        valid: boolean;
        message?: string;
    };
}
//# sourceMappingURL=password.util.d.ts.map