import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private resend: Resend;
  private fromAddress: string;

  constructor() {
    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
      this.logger.warn(
        'RESEND_API_KEY is not set — email sending will fail at runtime',
      );
    }

    this.resend = new Resend(apiKey);

    // onboarding@resend.dev works WITHOUT a custom domain
    // It can send to ANY email address (not just your own)
    this.fromAddress =
      process.env.RESEND_FROM || 'Mulema App <onboarding@resend.dev>';

    this.logger.log(
      `Email service (Resend HTTP API) initialized — from: ${this.fromAddress}`,
    );
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
      const { data, error } = await this.resend.emails.send({
        from: this.fromAddress,
        to: [email],
        subject,
        text,
        html,
      });

      if (error) {
        this.logger.error(
          `Resend API error sending to ${email}: ${JSON.stringify(error)}`,
        );
        throw new Error(`Email delivery failed: ${error.message}`);
      }

      this.logger.log(
        `Email sent successfully to ${email} — id: ${data?.id}`,
      );
      return data;
    } catch (error) {
      this.logger.error(`Failed to send email to ${email}`, error);
      throw error;
    }
  }

  async sendTestEmail(email: string) {
    return this.sendOtp(email, 'TEST123', 'verification');
  }
}
