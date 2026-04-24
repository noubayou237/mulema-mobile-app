import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private resend: Resend;

  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY);
    this.logger.log('Email service (Resend) initialized');
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
      const { data, error } = await this.resend.emails.send({
        from: process.env.RESEND_FROM || 'onboarding@resend.dev',
        to: email,
        subject: subject,
        text: text,
        html: html,
      });

      if (error) {
        throw error;
      }

      this.logger.log(`Email sent successfully to ${email}: ${data?.id}`);
      return data;
    } catch (error) {
      this.logger.error(`Failed to send email to ${email}`, error);
      throw error;
    }
  }

  async sendTestEmail(email: string) {
    return this.sendOtp(email, 'TEST', 'verification');
  }
}
