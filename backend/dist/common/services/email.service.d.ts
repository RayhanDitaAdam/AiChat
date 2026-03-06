export declare class EmailService {
    private static transporter;
    private static getCompanyName;
    private static getFooterHtml;
    private static getHeaderHtml;
    private static wrapHtml;
    /**
     * Sends a branded OTP email for verification
     */
    static sendOTP(to: string, name: string, code: string): Promise<void>;
    /**
     * Sends 2FA verification email with clickable code options
     */
    static send2FAEmail(to: string, name: string, code: string): Promise<void>;
    static sendCustomEmail(to: string, subject: string, body: string): Promise<void>;
    /**
     * Sends a branded password reset link
     */
    static sendResetPasswordLink(to: string, name: string, link: string): Promise<void>;
    /**
     * Sends a branded task assignment email to staff
     */
    static sendTaskAssignmentEmail(to: string, data: {
        staffName: string;
        taskDetail: string;
        location: string;
        ownerName: string;
        id: string;
    }): Promise<void>;
    /**
     * Sends a branded reminder email
     */
    static sendReminderEmail(to: string, name: string, eventContent: string): Promise<void>;
    /**
     * Sends a branded expiry notification email to owner
     */
    static sendExpiryNotification(to: string, ownerName: string, productData: {
        name: string;
        expiryDate: string;
        status: 'EXPIRED' | 'EXPIRING_SOON';
    }): Promise<void>;
    /**
     * Sends a notification to store owner about a new contributor request
     */
    static sendContributorRequestEmail(to: string, ownerName: string, requesterData: {
        name: string;
        email: string;
    }): Promise<void>;
    static sendApplicationStatusEmail(to: string, userName: string, companyName: string, status: 'ACCEPTED' | 'REJECTED', vacancyTitle: string): Promise<void>;
}
//# sourceMappingURL=email.service.d.ts.map