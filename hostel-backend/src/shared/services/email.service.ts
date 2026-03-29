import { config } from '../../shared/config/config';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

class EmailService {
  async sendVerificationEmail(email: string, token: string, userName: string) {
    const verificationUrl = `${config.FRONTEND_URL}/verify-email?token=${token}`;
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
          <meta charset="UTF-8">
          <title>Email Verification</title>
          <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #4f46e5; color: white; padding: 20px; text-align: center; }
              .content { background: #f9f9f9; padding: 20px; border-radius: 5px; }
              .button { display: inline-block; padding: 12px 24px; background: #4f46e5; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
              .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header">
                  <h1>HostelEase</h1>
                  <p>Email Verification Required</p>
              </div>
              <div class="content">
                  <h2>Hello ${userName},</h2>
                  <p>Thank you for registering with HostelEase.</p>
                  <p>Please click the button below to verify your email address and activate your account:</p>
                  <div style="text-align: center;">
                      <a href="${verificationUrl}" class="button">Verify Email</a>
                  </div>
                  <p>If the button doesn't work, you can also copy and paste this link into your browser:</p>
                  <p style="word-break: break-all; color: #4f46e5;">${verificationUrl}</p>
                  <p>This verification link will expire in 24 hours.</p>
              </div>
              <div class="footer">
                  <p>If you didn't request this verification, please ignore this email.</p>
                  <p>&copy; 2026 HostelEase. All rights reserved.</p>
              </div>
          </div>
      </body>
      </html>
    `;

    console.log('=== EMAIL VERIFICATION ===');
    console.log(`To: ${email}`);
    console.log(`Verification URL: ${verificationUrl}`);
    console.log(`User Name: ${userName}`);
    console.log('=== END EMAIL ===');

    return true;
  }

  async sendPasswordResetEmail(email: string, token: string, userName: string) {
    const resetUrl = `${config.FRONTEND_URL}/reset-password?token=${token}`;
    
    console.log('=== PASSWORD RESET EMAIL ===');
    console.log(`To: ${email}`);
    console.log(`Reset URL: ${resetUrl}`);
    console.log(`User Name: ${userName}`);
    console.log('=== END EMAIL ===');

    return true;
  }
}

export const emailService = new EmailService();