function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; } import nodemailer from 'nodemailer';
import prisma from './prisma.service.js';

export class EmailService {
    static __initStatic() {
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        })
    }

    static async getBranding() {
        try {
            const config = await (prisma).systemConfig.findUnique({
                where: { id: 'global' }
            });
            return {
                companyName: _optionalChain([config, 'optionalAccess', _ => _.companyName]) || 'HeartAI',
                companyLogo: _optionalChain([config, 'optionalAccess', _ => _.companyLogo]) || "https://www.tailwindtap.com/_next/static/media/nav-logo.371aaafb.svg"
            };
        } catch (error) {
            return {
                companyName: 'HeartAI',
                companyLogo: "https://www.tailwindtap.com/_next/static/media/nav-logo.371aaafb.svg"
            };
        }
    }

    static getFooterHtml(to, companyName) {
        return `
        <footer style="margin-top: 2rem;">
            <p style="color: #6b7280;">
                This email was sent to <a href="mailto:${to}" style="color: #2563eb; text-decoration: none;" target="_blank">${to}</a>. 
                If you'd rather not receive this kind of email, you can <a href="#" style="color: #2563eb; text-decoration: none;">unsubscribe</a> or <a href="#" style="color: #2563eb; text-decoration: none;">manage your email preferences</a>.
            </p>
            <p style="margin-top: 0.75rem; color: #6b7280;">&copy; ${new Date().getFullYear()} ${companyName}. All Rights Reserved.</p>
        </footer>
        `;
    }

    static getHeaderHtml(logoUrl, isCid = false) {
        let logo = logoUrl || "https://www.tailwindtap.com/_next/static/media/nav-logo.371aaafb.svg";
        if (isCid) {
            logo = 'cid:company-logo';
        }
        return `
        <header>
            <img style="width: auto; height: 1.75rem;" src="${logo}" alt="Company Logo">
        </header>
        `;
    }

    static wrapHtml(content, to, companyName, companyLogo) {
        const isBase64 = companyLogo && companyLogo.startsWith('data:');
        return `
        <div style="font-family: Arial, sans-serif; background-color: #ffffff; margin: 0; padding: 0; color: #374151;">
            <section style="max-width: 42rem; padding: 2rem 1.5rem; margin: 0 auto; background-color: #ffffff;">
                ${this.getHeaderHtml(companyLogo, isBase64)}
                <main style="margin-top: 2rem;">
                    ${content}
                </main>
                ${this.getFooterHtml(to, companyName)}
            </section>
        </div>
        `;
    }

    static getAttachments(companyLogo) {
        if (companyLogo && companyLogo.startsWith('data:')) {
            return [{
                filename: 'logo.png',
                path: companyLogo,
                cid: 'company-logo'
            }];
        }
        return [];
    }

    /**
     * Sends a branded OTP email for verification
     */
    static async sendOTP(to, name, code) {
        const frontendUrl = (process.env.FRONTEND_URL || '').split(',')[0].trim() || 'https://panggaleh.com';
        const verificationLink = `${frontendUrl}/verify-email?email=${encodeURIComponent(to)}`;
        const { companyName, companyLogo } = await this.getBranding();

        // Split code into digits for the boxes
        const digits = code.split('');

        const content = `
            <h2 style="color: #374151; margin-top: 0; font-weight: 600; font-size: 1.5rem;">Hi ${name},</h2>
            <p style="margin-top: 0.5rem; line-height: 2; color: #4b5563;">
                This is your verification code:
            </p>
            <div style="display: flex; align-items: center; margin-top: 1rem; gap: 1rem;">
                ${digits.map(d => `<p style="display: flex; align-items: center; justify-content: center; width: 2.5rem; height: 2.5rem; font-size: 1.5rem; font-weight: 500; color: #3b82f6; border: 1px solid #3b82f6; border-radius: 0.375rem; margin: 0 0.5rem 0 0; text-align: center; line-height: 2.5rem;">${d}</p>`).join('')}
            </div>
            <p style="margin-top: 1rem; line-height: 2; color: #4b5563;">
                This code will only be valid for the next 10 minutes. If the code does not work, you can use this login verification link:
            </p>
            <a href="${verificationLink}" style="display: inline-block; padding: 0.5rem 1.5rem; margin-top: 1.5rem; font-size: 0.875rem; font-weight: 500; letter-spacing: 0.05em; color: #ffffff; text-transform: capitalize; background-color: #2563eb; border-radius: 0.5rem; text-decoration: none;">
                Verify email
            </a>
            <p style="margin-top: 2rem; color: #4b5563;">
                Thanks, <br>
                ${companyName} team
            </p>
        `;

        await this.transporter.sendMail({
            from: `"${companyName} Support" <${process.env.EMAIL_USER}>`,
            to,
            subject: `Verify your Email Address - ${companyName}`,
            text: `Welcome to ${companyName}! Your verification code is: ${code}`,
            html: this.wrapHtml(content, to, companyName, companyLogo),
            attachments: this.getAttachments(companyLogo)
        });
    }

    /**
     * Sends 2FA verification email with clickable code options
     */
    static async send2FAEmail(to, name, code) {
        const { companyName, companyLogo } = await this.getBranding();

        const content = `
            <h2 style="color: #374151; margin-top: 0; font-weight: 600; font-size: 1.5rem;">Hi ${name},</h2>
            <p style="margin-top: 0.5rem; line-height: 2; color: #4b5563;">
                To complete your login, please enter the following verification code:
            </p>
            <div style="margin-top: 1.5rem;">
                <p style="font-size: 2rem; font-weight: 700; color: #1f2937; letter-spacing: 0.25em; font-family: monospace; margin: 0;">${code}</p>
            </div>
            <p style="margin-top: 1.5rem; line-height: 2; color: #4b5563;">
                This code expires in <strong>60 seconds</strong>.<br>
                If you didn't request this code, your account might be compromised. Please contact support immediately.
            </p>
            <p style="margin-top: 2rem; color: #4b5563;">
                Thanks, <br>
                ${companyName} Team
            </p>
        `;

        await this.transporter.sendMail({
            from: `"${companyName} Security" <${process.env.EMAIL_USER}>`,
            to,
            subject: `Your Login Verification Code - ${companyName}`,
            text: `Hello ${name}! Your verification code is: ${code}. It expires in 60 seconds.`,
            html: this.wrapHtml(content, to, companyName, companyLogo),
            attachments: this.getAttachments(companyLogo)
        });
    }

    static async sendCustomEmail(to, subject, body) {
        const { companyName, companyLogo } = await this.getBranding();
        const content = `
            <h2 style="color: #374151; margin-top: 0; font-weight: 600; font-size: 1.5rem;">Hi there,</h2>
            <p style="margin-top: 0.5rem; line-height: 2; color: #4b5563;">
                ${body.replace(/\n/g, '<br>')}
            </p>
            <p style="margin-top: 2rem; color: #4b5563;">
                Thanks, <br>
                ${companyName} Team
            </p>
        `;

        await this.transporter.sendMail({
            from: `"${companyName}" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            text: body,
            html: this.wrapHtml(content, to, companyName, companyLogo),
            attachments: this.getAttachments(companyLogo)
        });
    }

    /**
     * Sends a branded password reset link
     */
    static async sendResetPasswordLink(to, name, link) {
        const { companyName, companyLogo } = await this.getBranding();

        const content = `
            <h2 style="color: #374151; margin-top: 0; font-weight: 600; font-size: 1.5rem;">Hi ${name},</h2>
            <p style="margin-top: 0.5rem; line-height: 2; color: #4b5563;">
                We received a request to reset your password. Click the button below to choose a new password:
            </p>
            <a href="${link}" style="display: inline-block; padding: 0.5rem 1.5rem; margin-top: 1.5rem; font-size: 0.875rem; font-weight: 500; letter-spacing: 0.05em; color: #ffffff; text-transform: capitalize; background-color: #2563eb; border-radius: 0.5rem; text-decoration: none;">
                Reset Password
            </a>
            <p style="margin-top: 1.5rem; line-height: 2; color: #4b5563;">
                If you did not request a password reset, please ignore this email or contact support if you have concerns.
                This link will expire in <strong>1 hour</strong>.
            </p>
            <p style="margin-top: 2rem; color: #4b5563;">
                Thanks, <br>
                ${companyName} Team
            </p>
        `;

        await this.transporter.sendMail({
            from: `"${companyName} Support" <${process.env.EMAIL_USER}>`,
            to,
            subject: `Reset your Password - ${companyName}`,
            text: `Hello ${name}! Click the following link to reset your password: ${link}`,
            html: this.wrapHtml(content, to, companyName, companyLogo),
            attachments: this.getAttachments(companyLogo)
        });
    }

    /**
     * Sends a branded task assignment email to staff
     */
    static async sendTaskAssignmentEmail(to, data) {
        const { companyName, companyLogo } = await this.getBranding();

        const content = `
            <h2 style="color: #374151; margin-top: 0; font-weight: 600; font-size: 1.5rem;">Hi ${data.staffName},</h2>
            <p style="margin-top: 0.5rem; line-height: 2; color: #4b5563;">
                You have been assigned a new task at <strong>${data.ownerName}</strong>.
            </p>
            <hr style="border-color: #e5e7eb; margin: 1.5rem 0; border-style: solid; border-width: 1px 0 0 0;">
            <div style="margin-top: 1rem;">
                <p style="margin: 0; color: #4b5563;"><strong>Location:</strong> ${data.location}</p>
                <p style="margin: 0.5rem 0 0 0; color: #4b5563;"><strong>Task Detail:</strong> ${data.taskDetail}</p>
                <p style="margin: 0.5rem 0 0 0; color: #4b5563;"><strong>Task ID:</strong> <code style="background-color: #f3f4f6; padding: 0.25rem 0.5rem; border-radius: 0.25rem; font-size: 0.875rem;">${data.id}</code></p>
            </div>
            <p style="margin-top: 1.5rem; line-height: 2; color: #4b5563;">
                Please complete the task and report through the system once done.
            </p>
            <p style="margin-top: 2rem; color: #4b5563;">
                Thanks, <br>
                Management Team
            </p>
        `;

        await this.transporter.sendMail({
            from: `"${companyName} Management" <${process.env.EMAIL_USER}>`,
            to,
            subject: `New Task Assigned: ${data.location} - ${companyName}`,
            text: `Hi ${data.staffName},\n\nYou have been assigned a new task at ${data.ownerName}.\n\nLocation: ${data.location}\nDetail: ${data.taskDetail}\nTask ID: ${data.id}\n\nPlease report once completed bre!`,
            html: this.wrapHtml(content, to, companyName, companyLogo),
            attachments: this.getAttachments(companyLogo)
        });
    }

    /**
     * Sends a branded reminder email
     */
    static async sendReminderEmail(to, name, eventContent) {
        const { companyName, companyLogo } = await this.getBranding();

        const content = `
            <h2 style="color: #374151; margin-top: 0; font-weight: 600; font-size: 1.5rem;">Hi ${name},</h2>
            <p style="margin-top: 0.5rem; line-height: 2; color: #4b5563;">
                You asked me to remind you about the following:
            </p>
            <div style="margin-top: 1.5rem; padding: 1.5rem; background-color: #f3f4f6; border-radius: 0.5rem; text-align: center;">
                <span style="font-size: 1.125rem; font-weight: 500; color: #2563eb;">"${eventContent}"</span>
            </div>
            <p style="margin-top: 1.5rem; line-height: 2; color: #4b5563;">
                This is an automated notification from your AI Assistant. Hope this helps you stay on track!
            </p>
            <p style="margin-top: 2rem; color: #4b5563;">
                Thanks, <br>
                ${companyName} Assistant
            </p>
        `;

        await this.transporter.sendMail({
            from: `"${companyName} Assistant" <${process.env.EMAIL_USER}>`,
            to,
            subject: `Reminder: Scheduled Event - ${companyName}`,
            text: `Hi ${name}, just reminding you about: ${eventContent}`,
            html: this.wrapHtml(content, to, companyName, companyLogo),
            attachments: this.getAttachments(companyLogo)
        });
    }

    /**
     * Sends a branded expiry notification email to owner
     */
    static async sendExpiryNotification(to, ownerName, productData) {
        const { companyName, companyLogo } = await this.getBranding();
        const isExpired = productData.status === 'EXPIRED';
        const title = isExpired ? "Product Expired!" : "Product Expiring Soon";

        const content = `
            <h2 style="color: #374151; margin-top: 0; font-weight: 600; font-size: 1.5rem;">Hi ${ownerName},</h2>
            <p style="margin-top: 0.5rem; line-height: 2; color: #4b5563;">
                This is an automated notification regarding your inventory item <strong style="color: #374151;">${title}</strong>:
            </p>
            <hr style="border-color: #e5e7eb; margin: 1.5rem 0; border-style: solid; border-width: 1px 0 0 0;">
            <div style="margin-top: 1rem;">
                <p style="margin: 0; color: #4b5563;"><strong>Product Name:</strong> ${productData.name}</p>
                <p style="margin: 0.5rem 0 0 0; color: #4b5563;"><strong>Expiry Date:</strong> <span style="color: ${isExpired ? '#dc2626' : '#d97706'}; font-weight: 500;">${productData.expiryDate}</span></p>
            </div>
            <p style="margin-top: 1.5rem; line-height: 2; color: #4b5563;">
                ${isExpired
                ? 'Please remove this item from your shelves and update your inventory management system immediately.'
                : 'Please consider running a promotion or clearing this stock before the expiry date to minimize losses.'}
            </p>
            <p style="margin-top: 2rem; color: #4b5563;">
                Thanks, <br>
                ${companyName} Inventory System
            </p>
        `;

        await this.transporter.sendMail({
            from: `"${companyName} Inventory" <${process.env.EMAIL_USER}>`,
            to,
            subject: `${title}: ${productData.name} - ${companyName}`,
            text: `Hi ${ownerName}, the product "${productData.name}" ${isExpired ? 'has expired' : 'is about to expire'} on ${productData.expiryDate}.`,
            html: this.wrapHtml(content, to, companyName, companyLogo),
            attachments: this.getAttachments(companyLogo)
        });
    }

    /**
     * Sends a notification to store owner about a new contributor request
     */
    static async sendContributorRequestEmail(to, ownerName, requesterData) {
        const { companyName, companyLogo } = await this.getBranding();
        const frontendUrl = (process.env.FRONTEND_URL || '').split(',')[0].trim() || 'https://panggaleh.com';

        const content = `
            <h2 style="color: #374151; margin-top: 0; font-weight: 600; font-size: 1.5rem;">Hi ${ownerName},</h2>
            <p style="margin-top: 0.5rem; line-height: 2; color: #4b5563;">
                Someone wants to help manage your store! You've received a new request to join your contributor community:
            </p>
            <hr style="border-color: #e5e7eb; margin: 1.5rem 0; border-style: solid; border-width: 1px 0 0 0;">
            <div style="margin-top: 1rem;">
                <p style="margin: 0; color: #4b5563;"><strong>Requester Name:</strong> ${requesterData.name}</p>
                <p style="margin: 0.5rem 0 0 0; color: #4b5563;"><strong>Email Address:</strong> ${requesterData.email}</p>
            </div>
            <p style="margin-top: 1.5rem; line-height: 2; color: #4b5563;">
                Please log in to your dashboard and navigate to "Contributor Requests" to approve or decline this request.
            </p>
            <a href="${frontendUrl}/owner/dashboard" style="display: inline-block; padding: 0.5rem 1.5rem; margin-top: 1.5rem; font-size: 0.875rem; font-weight: 500; letter-spacing: 0.05em; color: #ffffff; text-transform: capitalize; background-color: #2563eb; border-radius: 0.5rem; text-decoration: none;">
                Review Request
            </a>
            <p style="margin-top: 2rem; color: #4b5563;">
                Thanks, <br>
                ${companyName} System
            </p>
        `;

        await this.transporter.sendMail({
            from: `"${companyName} Contributor Program" <${process.env.EMAIL_USER}>`,
            to,
            subject: `New Contributor Request - ${companyName}`,
            text: `Hi ${ownerName}, you have a new contributor request from ${requesterData.name} (${requesterData.email}). Please check your dashboard to review.`,
            html: this.wrapHtml(content, to, companyName, companyLogo),
            attachments: this.getAttachments(companyLogo)
        });
    }

    static async sendApplicationStatusEmail(to, userName, companyName, status, vacancyTitle) {
        const { companyName: globalCompanyName, companyLogo } = await this.getBranding();
        const isAccepted = status === 'ACCEPTED';
        const title = isAccepted ? "Application Accepted!" : "Application Update";
        const statusText = isAccepted ? "Congratulations! Your application has been accepted." : "Thank you for your application, however, we have decided to move forward with other candidates at this time.";

        const content = `
            <h2 style="color: #374151; margin-top: 0; font-weight: 600; font-size: 1.5rem;">Hi ${userName},</h2>
            <p style="margin-top: 0.5rem; line-height: 2; color: #4b5563;">
                Regarding your application for <strong>${vacancyTitle}</strong> at <strong>${companyName}</strong>:
            </p>
            <div style="margin-top: 1.5rem; padding: 1.5rem; background-color: #f3f4f6; border-radius: 0.5rem; text-align: center;">
                <span style="font-size: 1.125rem; font-weight: 500; color: #374151;">${statusText}</span>
            </div>
            <p style="margin-top: 1.5rem; line-height: 2; color: #4b5563;">
                ${isAccepted ?
                'The store owner will contact you shortly with the next steps. Please ensure your contact details are up to date on your profile.' :
                'We appreciate your interest and wish you the best in your future endeavors.'
            }
            </p>
            <p style="margin-top: 2rem; color: #4b5563;">
                Thanks, <br>
                ${companyName} via ${globalCompanyName}
            </p>
        `;

        await this.transporter.sendMail({
            from: `"${globalCompanyName} Careers" <${process.env.EMAIL_USER}>`,
            to,
            subject: `Update on your application for ${vacancyTitle} at ${companyName} - ${globalCompanyName}`,
            text: `Hi ${userName}, regarding your application for ${vacancyTitle} at ${companyName}: ${statusText}`,
            html: this.wrapHtml(content, to, globalCompanyName, companyLogo),
            attachments: this.getAttachments(companyLogo)
        });
    }
} EmailService.__initStatic();
