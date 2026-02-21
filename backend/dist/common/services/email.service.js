import nodemailer from 'nodemailer';
export class EmailService {
    static transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });
    /**
     * Sends a branded OTP email for verification
     */
    static async sendOTP(to, name, code) {
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
    /**
     * Sends 2FA verification email with clickable code options
     */
    static async send2FAEmail(to, name, code) {
        await this.transporter.sendMail({
            from: `"HeartAI Security" <${process.env.EMAIL_USER}>`,
            to,
            subject: "Your Login Verification Code - HeartAI",
            text: `Hello ${name}! Your verification code is: ${code}. It expires in 60 seconds.`,
            html: `
                <div style="font-family: 'Inter', sans-serif; background-color: #ffffff; margin: 0; padding: 0;">
                    <div style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
                        
                        <!-- Header -->
                        <div style="padding: 32px; text-align: center;">
                            <img src="https://www.tailwindtap.com/_next/static/media/nav-logo.371aaafb.svg" alt="HeartAI Logo" style="height: 40px;">
                        </div>

                        <!-- Banner -->
                        <div style="background-color: #365CCE; padding: 40px 20px; text-align: center; color: #ffffff;">
                            <div style="letter-spacing: 2px; font-size: 14px; margin-bottom: 12px; font-weight: 300;">LOGIN VERIFICATION</div>
                            <h1 style="margin: 0; font-size: 28px; font-weight: 700; text-transform: capitalize;">Verify Your Identity</h1>
                        </div>

                        <!-- Main Content -->
                        <div style="padding: 40px 32px; color: #334155; line-height: 1.6;">
                            <h2 style="font-size: 18px; margin-bottom: 16px; color: #1e293b;">Hello ${name},</h2>
                            <p style="margin-bottom: 24px; color: #475569;">To complete your login, please enter the following verification code:</p>
                            
                            <!-- Code Display -->
                            <div style="text-align: center; margin: 32px 0;">
                                <div style="background-color: #f1f5f9; color: #334155; padding: 24px; border-radius: 12px; font-weight: 700; display: inline-block; font-size: 32px; letter-spacing: 8px; font-family: 'Courier New', monospace; border: 2px solid #e2e8f0;">
                                    ${code}
                                </div>
                                <p style="margin-top: 16px; color: #64748b; font-size: 14px;">This code expires in <strong>60 seconds</strong>.</p>
                            </div>

                            <p style="margin-bottom: 24px; color: #475569;">
                                If you didn't request this code, your account might be compromised. Please contact support immediately.
                            </p>
                            
                            <p style="margin-bottom: 24px; color: #475569;">
                                Thank you,
                                <br>
                                <strong>HeartAI Team</strong>
                            </p>
                        </div>

                        <!-- Footer Info -->
                        <div style="padding: 0 32px; color: #94a3b8; font-size: 13px;">
                            <p>This email was sent from <a href="mailto:support@heartai.com" style="color: #365CCE; text-decoration: none;">support@heartai.com</a>.</p>
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
    static async sendCustomEmail(to, subject, body) {
        await this.transporter.sendMail({
            from: `"HeartAI" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            text: body,
            html: `<div style="font-family: sans-serif;">${body.replace(/\n/g, '<br>')}</div>`
        });
    }
    /**
     * Sends a branded password reset link
     */
    static async sendResetPasswordLink(to, name, link) {
        await this.transporter.sendMail({
            from: `"HeartAI Support" <${process.env.EMAIL_USER}>`,
            to,
            subject: "Reset your Password - HeartAI",
            text: `Hello ${name}! Click the following link to reset your password: ${link}`,
            html: `
                <div style="font-family: 'Inter', sans-serif; background-color: #ffffff; margin: 0; padding: 0;">
                    <div style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
                        
                        <!-- Header -->
                        <div style="padding: 32px; text-align: center;">
                            <img src="https://www.tailwindtap.com/_next/static/media/nav-logo.371aaafb.svg" alt="HeartAI Logo" style="height: 40px;">
                        </div>

                        <!-- Banner -->
                        <div style="background-color: #365CCE; padding: 40px 20px; text-align: center; color: #ffffff;">
                            <div style="letter-spacing: 2px; font-size: 14px; margin-bottom: 12px; font-weight: 300;">PASSWORD RESET</div>
                            <h1 style="margin: 0; font-size: 28px; font-weight: 700; text-transform: capitalize;">Reset your Password</h1>
                        </div>

                        <!-- Main Content -->
                        <div style="padding: 40px 32px; color: #334155; line-height: 1.6;">
                            <h2 style="font-size: 18px; margin-bottom: 16px; color: #1e293b;">Hello ${name},</h2>
                            <p style="margin-bottom: 24px; color: #475569;">We received a request to reset your password. Click the button below to choose a new password:</p>
                            
                            <div style="text-align: center; margin: 32px 0;">
                                <a href="${link}" style="background-color: #ea580c; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 700; display: inline-block; font-size: 16px;">Reset Password</a>
                            </div>

                            <p style="margin-bottom: 24px; color: #475569;">
                                If you did not request a password reset, please ignore this email or contact support if you have concerns.
                                This link will expire in <span style="font-weight: 700; color: #1e293b;">1 hour</span>.
                            </p>

                            <p style="margin-top: 40px; color: #64748b;">
                                Thank you,<br>
                                <strong>HeartAI Team</strong>
                            </p>
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
    /**
     * Sends a branded task assignment email to staff
     */
    static async sendTaskAssignmentEmail(to, data) {
        await this.transporter.sendMail({
            from: `"HeartAI Management" <${process.env.EMAIL_USER}>`,
            to,
            subject: `New Task Assigned: ${data.location} - HeartAI`,
            text: `Hi ${data.staffName},\n\nYou have been assigned a new task at ${data.ownerName}.\n\nLocation: ${data.location}\nDetail: ${data.taskDetail}\nTask ID: ${data.id}\n\nPlease report once completed bre!`,
            html: `
                <div style="font-family: 'Inter', sans-serif; background-color: #ffffff; margin: 0; padding: 0;">
                    <div style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
                        
                        <!-- Header -->
                        <div style="padding: 32px; text-align: center;">
                            <img src="https://www.tailwindtap.com/_next/static/media/nav-logo.371aaafb.svg" alt="HeartAI Logo" style="height: 40px;">
                        </div>

                        <!-- Banner -->
                        <div style="background-color: #365CCE; padding: 40px 20px; text-align: center; color: #ffffff;">
                            <div style="letter-spacing: 2px; font-size: 14px; margin-bottom: 12px; font-weight: 300;">NEW TASK ASSIGNED</div>
                            <h1 style="margin: 0; font-size: 28px; font-weight: 700; text-transform: capitalize;">Staff Task Assignment</h1>
                        </div>

                        <!-- Main Content -->
                        <div style="padding: 40px 32px; color: #334155; line-height: 1.6;">
                            <h2 style="font-size: 18px; margin-bottom: 16px; color: #1e293b;">Hi ${data.staffName},</h2>
                            <p style="margin-bottom: 24px; color: #475569;">You have been assigned a new task at <b>${data.ownerName}</b>.</p>
                            
                            <div style="background-color: #f8fafc; border-radius: 12px; padding: 24px; margin-bottom: 32px; border: 1px solid #f1f5f9;">
                                <div style="margin-bottom: 16px;">
                                    <span style="font-[10px]; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 4px;">Location</span>
                                    <span style="font-size: 16px; font-weight: 700; color: #1e293b;">${data.location}</span>
                                </div>
                                <div style="margin-bottom: 16px;">
                                    <span style="font-size: 10px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 4px;">Task Detail</span>
                                    <span style="font-size: 15px; font-weight: 500; color: #475569;">${data.taskDetail}</span>
                                </div>
                                <div>
                                    <span style="font-size: 10px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 4px;">Task ID</span>
                                    <code style="background-color: #e2e8f0; padding: 4px 8px; border-radius: 4px; color: #1e293b; font-size: 13px;">${data.id}</code>
                                </div>
                            </div>

                            <p style="margin-bottom: 24px; color: #475569;">
                                Please complete the task and report through the system.
                            </p>

                            <p style="margin-top: 40px; color: #64748b;">
                                Best regards,<br>
                                <strong>Management Team</strong>
                            </p>
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
    /**
     * Sends a branded reminder email
     */
    static async sendReminderEmail(to, name, content) {
        await this.transporter.sendMail({
            from: `"HeartAI Assistant" <${process.env.EMAIL_USER}>`,
            to,
            subject: "Reminder: Scheduled Event - HeartAI",
            text: `Hi ${name}, just reminding you about: ${content}`,
            html: `
                <div style="font-family: 'Inter', sans-serif; background-color: #ffffff; margin: 0; padding: 0;">
                    <div style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
                        
                        <!-- Header -->
                        <div style="padding: 32px; text-align: center;">
                            <img src="https://www.tailwindtap.com/_next/static/media/nav-logo.371aaafb.svg" alt="HeartAI Logo" style="height: 40px;">
                        </div>

                        <!-- Banner -->
                        <div style="background-color: #365CCE; padding: 40px 20px; text-align: center; color: #ffffff;">
                            <div style="letter-spacing: 2px; font-size: 14px; margin-bottom: 12px; font-weight: 300;">SCHEDULED REMINDER</div>
                            <h1 style="margin: 0; font-size: 28px; font-weight: 700; text-transform: capitalize;">Time for your Reminder!</h1>
                        </div>

                        <!-- Main Content -->
                        <div style="padding: 40px 32px; color: #334155; line-height: 1.6;">
                            <h2 style="font-size: 18px; margin-bottom: 16px; color: #1e293b;">Hello ${name},</h2>
                            <p style="margin-bottom: 24px; color: #475569;">You asked me to remind you about the following:</p>
                            
                            <div style="background-color: #f8fafc; border-radius: 12px; padding: 24px; margin-bottom: 32px; border: 1px solid #f1f5f9; text-align: center;">
                                <span style="font-size: 18px; font-weight: 700; color: #365CCE;">"${content}"</span>
                            </div>

                            <p style="margin-bottom: 24px; color: #475569;">
                                This is an automated notification from your AI Assistant. 
                                Hope this helps you stay on track!
                            </p>

                            <p style="margin-top: 40px; color: #64748b;">
                                Thank you,<br>
                                <strong>HeartAI Assistant</strong>
                            </p>
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
    /**
     * Sends a branded expiry notification email to owner
     */
    static async sendExpiryNotification(to, ownerName, productData) {
        const isExpired = productData.status === 'EXPIRED';
        const title = isExpired ? "Product Expired!" : "Product Expiring Soon";
        const bannerColor = isExpired ? "#e11d48" : "#f59e0b"; // Rose 600 or Amber 500
        await this.transporter.sendMail({
            from: `"HeartAI Inventory" <${process.env.EMAIL_USER}>`,
            to,
            subject: `${title}: ${productData.name} - HeartAI`,
            text: `Hi ${ownerName}, the product "${productData.name}" ${isExpired ? 'has expired' : 'is about to expire'} on ${productData.expiryDate}.`,
            html: `
                <div style="font-family: 'Inter', sans-serif; background-color: #ffffff; margin: 0; padding: 0;">
                    <div style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
                        
                        <!-- Header -->
                        <div style="padding: 32px; text-align: center;">
                            <img src="https://www.tailwindtap.com/_next/static/media/nav-logo.371aaafb.svg" alt="HeartAI Logo" style="height: 40px;">
                        </div>

                        <!-- Banner -->
                        <div style="background-color: ${bannerColor}; padding: 40px 20px; text-align: center; color: #ffffff;">
                            <div style="letter-spacing: 2px; font-size: 14px; margin-bottom: 12px; font-weight: 300;">INVENTORY ALERT</div>
                            <h1 style="margin: 0; font-size: 28px; font-weight: 700; text-transform: capitalize;">${title}</h1>
                        </div>

                        <!-- Main Content -->
                        <div style="padding: 40px 32px; color: #334155; line-height: 1.6;">
                            <h2 style="font-size: 18px; margin-bottom: 16px; color: #1e293b;">Hello ${ownerName},</h2>
                            <p style="margin-bottom: 24px; color: #475569;">
                                This is an automated notification regarding your inventory item:
                            </p>
                            
                            <div style="background-color: #f8fafc; border-radius: 12px; padding: 24px; margin-bottom: 32px; border: 1px solid #f1f5f9;">
                                <div style="margin-bottom: 16px;">
                                    <span style="font-size: 10px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 4px;">Product Name</span>
                                    <span style="font-size: 16px; font-weight: 700; color: #1e293b;">${productData.name}</span>
                                </div>
                                <div>
                                    <span style="font-size: 10px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 4px;">Expiry Date</span>
                                    <span style="font-size: 15px; font-weight: 700; color: ${isExpired ? '#e11d48' : '#d97706'}">${productData.expiryDate}</span>
                                </div>
                            </div>

                            <p style="margin-bottom: 24px; color: #475569;">
                                ${isExpired
                ? 'Please remove this item from your shelves and update your inventory management system immediately.'
                : 'Please consider running a promotion or clearing this stock before the expiry date to minimize losses.'}
                            </p>

                            <p style="margin-top: 40px; color: #64748b;">
                                Thank you,<br>
                                <strong>HeartAI Inventory System</strong>
                            </p>
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
}
//# sourceMappingURL=email.service.js.map