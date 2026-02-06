export declare class EmailService {
    private static transporter;
    /**
     * Sends a branded OTP email for verification
     */
    static sendOTP(to: string, name: string, code: string): Promise<void>;
    static sendCustomEmail(to: string, subject: string, body: string): Promise<void>;
}
//# sourceMappingURL=email.service.d.ts.map