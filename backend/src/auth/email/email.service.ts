import * as nodemailer from 'nodemailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
  private transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASSWORD,
    },
  });

  async sendOtp(email: string, otp: string) {
    await this.transporter.sendMail({
      from: 'Mulema',
      to: email,
      subject: 'Your OTP Code',
      text: `Your OTP code is ${otp}. It expires in 5 minutes.`,
      html: `<p>Your OTP code is <b>${otp}</b>. It expires in 5 minutes.</p>`,
    });
  }
}
