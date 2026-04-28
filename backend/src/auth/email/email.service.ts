import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly apiKey: string;
  private readonly fromEmail: string;
  private readonly fromName: string;

  constructor() {
    this.apiKey = process.env.BREVO_API_KEY || '';

    if (!this.apiKey) {
      this.logger.error('BREVO_API_KEY is not set. Emails will NOT be delivered.');
    }

    // Parse "Display Name <email@example.com>" or fall back to SMTP_USER
    const from = process.env.SMTP_FROM || '';
    const match = from.match(/^"?([^"<]+)"?\s*<([^>]+)>$/);
    if (match) {
      this.fromName = match[1].trim();
      this.fromEmail = match[2].trim();
    } else {
      this.fromName = 'Mulema App';
      this.fromEmail = process.env.SMTP_USER || '';
    }

    this.logger.log(`Email service (Brevo HTTP API) initialized — from: ${this.fromName} <${this.fromEmail}>`);
  }

  async sendOtp(email: string, otpCode: string, purpose: string = 'verification') {
    const subject = purpose === 'reset' ? 'Password Reset Code' : 'Email Verification Code';

    const textContent = purpose === 'reset'
      ? `Your password reset code is: ${otpCode}. This code expires in 10 minutes.`
      : `Your email verification code is: ${otpCode}. This code expires in 10 minutes.`;

    const htmlContent = purpose === 'reset'
      ? `<p>Your password reset code is:</p><h2>${otpCode}</h2><p>This code expires in 10 minutes.</p>`
      : `<p>Your email verification code is:</p><h2>${otpCode}</h2><p>This code expires in 10 minutes.</p>`;

    this.logger.log(`🚨 OTP CODE FOR ${email}: ${otpCode} 🚨`);

    try {
      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'api-key': this.apiKey,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          sender: { name: this.fromName, email: this.fromEmail },
          to: [{ email }],
          subject,
          textContent,
          htmlContent,
        }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Brevo API error ${response.status}: ${errorBody}`);
      }

      const data = await response.json() as { messageId?: string };
      this.logger.log(`Email sent successfully to ${email} — messageId: ${data.messageId}`);
      return data;
    } catch (error: any) {
      this.logger.error(`Failed to send email to ${email}: ${error.message}`, error);
      throw new InternalServerErrorException(`Email delivery failed: ${error.message}`);
    }
  }

  async sendTestEmail(email: string) {
    return this.sendOtp(email, 'TEST123', 'verification');
  }
}
