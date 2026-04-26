import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor() {
    const smtpPort = Number(process.env.SMTP_PORT) || 465;

    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: smtpPort,
      // Port 465 = implicit TLS (secure: true)
      // Port 587 = STARTTLS (secure: false)
      secure: smtpPort === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      // Aggressive timeouts so requests fail fast instead of hanging
      connectionTimeout: 8000, // 8s to establish TCP connection
      greetingTimeout: 8000,   // 8s for SMTP greeting
      socketTimeout: 10000,    // 10s for socket inactivity
      // Required for some cloud environments
      tls: {
        rejectUnauthorized: true,
      },
    });

    // Verify connection — log result but don't block startup
    this.transporter.verify((error) => {
      if (error) {
        this.logger.error('SMTP connection verification failed:', error.message);
        this.logger.warn(
          'Emails may not work. Ensure SMTP_USER, SMTP_PASS, SMTP_HOST, and SMTP_PORT are set correctly.',
        );
      } else {
        this.logger.log('Email service (Nodemailer/Gmail) ready ✓');
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
      this.logger.error(
        `Failed to send email to ${email}: ${error.message}`,
      );
      throw error;
    }
  }

  async sendTestEmail(email: string) {
    return this.sendOtp(email, 'TEST', 'verification');
  }
}
