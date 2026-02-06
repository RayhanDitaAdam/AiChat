import nodemailer from 'nodemailer';

export class EmailService {
    private static transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    /**
     * Sends a branded OTP email for verification
     */
    static async sendOTP(to: string, name: string, code: string) {
        const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const verificationLink = `${baseUrl}/verify-email?email=${encodeURIComponent(to)}`;

        // Split code into digits for the boxes
        const digits = code.split('');

        await this.transporter.sendMail({
            from: `"HeartAI Support" <${process.env.EMAIL_USER}>`,
            to,
            subject: "Verify your Email Address - HeartAI",
            text: `Welcome to HeartAI! Your verification code is: ${code}`,
            html: `
                <div style="font-family: 'Inter', sans-serif; background-color: #ffffff; margin: 0; padding: 0;">
                    <div style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
                        
                        <!-- Header -->
                        <div style="padding: 32px; text-align: center;">
                            <img src="https://www.tailwindtap.com/_next/static/media/nav-logo.371aaafb.svg" alt="HeartAI Logo" style="height: 40px;">
                        </div>

                        <!-- Banner -->
                        <div style="background-color: #365CCE; padding: 40px 20px; text-align: center; color: #ffffff;">
                            <div style="letter-spacing: 2px; font-size: 14px; margin-bottom: 12px; font-weight: 300;">THANKS FOR SIGNING UP!</div>
                            <h1 style="margin: 0; font-size: 28px; font-weight: 700; text-transform: capitalize;">Verify your E-mail Address</h1>
                        </div>

                        <!-- Main Content -->
                        <div style="padding: 40px 32px; color: #334155; line-height: 1.6;">
                            <h2 style="font-size: 18px; margin-bottom: 16px; color: #1e293b;">Hello ${name},</h2>
                            <p style="margin-bottom: 24px; color: #475569;">Please use the following One Time Password (OTP) to activate your account:</p>
                            
                            <!-- OTP Boxes -->
                            <div style="display: flex; gap: 10px; margin-bottom: 32px; justify-content: center;">
                                ${digits.map(d => `
                                    <div style="width: 45px; height: 50px; line-height: 50px; text-align: center; font-size: 24px; font-weight: 700; color: #365CCE; border: 2px solid #365CCE; border-radius: 6px; margin: 0 4px; display: inline-block;">${d}</div>
                                `).join('')}
                            </div>

                            <p style="margin-bottom: 24px; color: #475569;">
                                This passcode will only be valid for the next <span style="font-weight: 700; color: #1e293b;">10 minutes</span>. 
                                If the passcode does not work, you can use the verification button below:
                            </p>

                            <div style="text-align: center; margin-top: 32px;">
                                <a href="${verificationLink}" style="background-color: #ea580c; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 700; display: inline-block; font-size: 16px;">Verify email</a>
                            </div>

                            <p style="margin-top: 40px; color: #64748b;">
                                Thank you,<br>
                                <strong>HeartAI Team</strong>
                            </p>
                        </div>

                        <!-- Footer Info -->
                        <div style="padding: 0 32px; color: #94a3b8; font-size: 13px;">
                            <p>This email was sent from <a href="mailto:support@heartai.com" style="color: #365CCE; text-decoration: none;">support@heartai.com</a>. If you'd rather not receive this kind of email, you can <a href="#" style="color: #365CCE; text-decoration: none;">unsubscribe</a>.</p>
                        </div>

                        <!-- Contact Footer -->
                        <div style="background-color: #f8fafc; padding: 40px 32px; text-align: center; border-top: 1px solid #f1f5f9; margin-top: 32px;">
                            <h3 style="color: #365CCE; font-size: 18px; margin-bottom: 12px; font-weight: 600;">Get in touch</h3>
                            <p style="margin: 4px 0;"><a href="tel:+6285112345678" style="color: #64748b; text-decoration: none;">+62-851-1234-5678</a></p>
                            <p style="margin: 4px 0;"><a href="mailto:support@heartai.com" style="color: #64748b; text-decoration: none;">support@heartai.com</a></p>
                            
                            <div style="margin-top: 24px;">
                                <!-- Social Icons placeholder -->
                                <span style="margin: 0 8px; color: #94a3b8;">FB</span>
                                <span style="margin: 0 8px; color: #94a3b8;">LI</span>
                                <span style="margin: 0 8px; color: #94a3b8;">IG</span>
                            </div>
                        </div>

                        <!-- Copyright -->
                        <div style="background-color: #365CCE; padding: 20px; text-align: center; color: #ffffff; font-size: 12px;">
                            <p style="margin: 0;">&copy; ${new Date().getFullYear()} HeartAI. All Rights Reserved.</p>
                        </div>
                    </div>
                </div>
            `
        });
    }

    static async sendCustomEmail(to: string, subject: string, body: string) {
        await this.transporter.sendMail({
            from: `"HeartAI" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            text: body,
            html: `<div style="font-family: sans-serif;">${body.replace(/\n/g, '<br>')}</div>`
        });
    }
}
