import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Verify connection configuration
    this.transporter.verify((error) => {
      if (error) {
        this.logger.error('SMTP Connection setup failed:', error);
      } else {
        this.logger.log('Email service (Nodemailer) ready state: Active');
      }
    });
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
        ? `Your password reset code is: ${otpCode}`
        : `Your email verification code is: ${otpCode}`;

    const html =
      purpose === 'reset'
        ? `<p>Your password reset code is:</p><h2>${otpCode}</h2><p>This code expires in 10 minutes.</p>`
        : `<p>Your email verification code is:</p><h2>${otpCode}</h2><p>This code expires in 10 minutes.</p>`;

    try {
      const info = await this.transporter.sendMail({
        from: process.env.SMTP_FROM || '"Mulema App" <noreply@mulema.app>',
        to: email,
        subject: subject,
        text: text,
        html: html,
      });

      this.logger.log(`Email sent successfully to ${email}: ${info.messageId}`);
      return info;
    } catch (error) {
      this.logger.error(`Failed to send email to ${email}`, error);
      throw error;
    }
  }

  async sendTestEmail(email: string) {
    return this.sendOtp(email, 'TEST', 'verification');
  }
}
