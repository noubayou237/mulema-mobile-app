import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;
  private fromAddress: string;

  constructor() {
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const host = process.env.SMTP_HOST || 'smtp.gmail.com';
    const port = Number(process.env.SMTP_PORT) || 465;

    if (!user || !pass) {
      this.logger.error('SMTP_USER or SMTP_PASS is not set in environment variables. Emails will NOT be delivered.');
    }

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      requireTLS: port === 587,
      auth: {
        user,
        pass,
      },
    });

    this.fromAddress = process.env.SMTP_FROM || `"Mulema App" <${user}>`;

    this.logger.log(`Email service (Nodemailer) initialized — from: ${this.fromAddress}`);
  }

  async sendOtp(
    email: string,
    otpCode: string,
    purpose: string = 'verification',
  ) {
    const subject =
      purpose === 'reset' ? 'Password Reset Code' : 'Email Verification Code';

    const text =
      purpose === 'reset'
        ? `Your password reset code is: ${otpCode}. This code expires in 10 minutes.`
        : `Your email verification code is: ${otpCode}. This code expires in 10 minutes.`;

    const html =
      purpose === 'reset'
        ? `<p>Your password reset code is:</p><h2>${otpCode}</h2><p>This code expires in 10 minutes.</p>`
        : `<p>Your email verification code is:</p><h2>${otpCode}</h2><p>This code expires in 10 minutes.</p>`;

    try {
      this.logger.log(`🚨 OTP CODE FOR ${email}: ${otpCode} 🚨`);
      
      const info = await this.transporter.sendMail({
        from: this.fromAddress,
        to: email,
        subject,
        text,
        html,
      });

      this.logger.log(`Email sent successfully to ${email} — messageId: ${info.messageId}`);
      return info;
    } catch (error: any) {
      this.logger.error(`Failed to send email to ${email}: ${error.message}`, error);
      throw new InternalServerErrorException(`Email delivery failed: ${error.message}`);
    }
  }

  async sendTestEmail(email: string) {
    return this.sendOtp(email, 'TEST123', 'verification');
  }
}
