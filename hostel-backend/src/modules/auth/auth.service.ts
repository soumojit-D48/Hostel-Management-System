import bcrypt from 'bcrypt';
import { nanoid } from 'nanoid';
import jwt from 'jsonwebtoken';
import { prisma } from '../../config/database';
import { Role } from '@prisma/client';
import { RegisterInput, LoginInput, VerifyEmailInput, ForgotPasswordInput, ResetPasswordInput } from './auth.validation';
import { ValidationError, NotFoundError } from '../../shared/middleware/error.middleware';
import { config } from '../../shared/config/config';
import { cacheService } from '../../shared/services/cache.service';
import { notificationService } from '../notifications/notification.service';

class AuthService {
  private generateToken(userId: string, email: string, role: Role): string {
    const payload = { userId, email, role };
    
    return (jwt as any).sign(payload, config.JWT_SECRET, { expiresIn: config.JWT_EXPIRES_IN });
  }

  async register(data: RegisterInput) {
    const { email, rollNumber, hostelId, blockId, password } = data;

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { rollNumber }
        ]
      }
    });

    if (existingUser) {
      if (existingUser.email === email) {
        throw new ValidationError('Email already exists');
      }
      if (existingUser.rollNumber === rollNumber) {
        throw new ValidationError('Roll number already exists');
      }
    }

    const hostel = await prisma.hostel.findUnique({
      where: { id: hostelId }
    });

    if (!hostel) {
      throw new ValidationError('Invalid hostel selected');
    }

    const block = await prisma.block.findFirst({
      where: {
        id: blockId,
        hostelId
      }
    });

    if (!block) {
      throw new ValidationError('Invalid block selected');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = nanoid(32);

    const user = await prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
        role: Role.STUDENT,
        isVerified: false,
        verificationToken,
        bloodGroup: data.bloodGroup || null,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isVerified: true,
      }
    });

    return {
      userId: user.id,
      email: user.email,
      verificationSent: true
    };
  }

  async login(data: LoginInput) {
    const { email, password, rememberMe } = data;

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        name: true,
        role: true,
        isVerified: true,
        avatar: true,
        hostel: {
          select: {
            id: true,
            name: true
          }
        },
        block: {
          select: {
            id: true,
            name: true
          }
        },
        roomNumber: true,
        lastLogin: true
      }
    });

    if (!user) {
      throw new ValidationError('Invalid email or password');
    }

    if (!user.isVerified) {
      throw new ValidationError('Please verify your email before logging in');
    }

    if (!user.password) {
      throw new ValidationError('Please use Google OAuth to login');
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new ValidationError('Invalid email or password');
    }

    const expiresIn = rememberMe ? '30d' : config.JWT_EXPIRES_IN;

    const secret = config.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET is not configured');
    }
    
    const payload = { userId: user.id, email: user.email, role: user.role };
    const token = (jwt as any).sign(payload, secret, { expiresIn });

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
        hostel: user.hostel,
        block: user.block,
        roomNumber: user.roomNumber
      }
    };
  }

  async verifyEmail(token: string) {
    const user = await prisma.user.findFirst({
      where: { verificationToken: token }
    });

    if (!user) {
      throw new ValidationError('Invalid or expired verification token');
    }

    if (user.isVerified) {
      throw new ValidationError('Email already verified');
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        verificationToken: null
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isVerified: true,
        hostel: {
          select: {
            id: true,
            name: true
          }
        },
        block: {
          select: {
            id: true,
            name: true
          }
        },
        roomNumber: true
      }
    });

    const jwtToken = this.generateToken(
      updatedUser.id,
      updatedUser.email,
      updatedUser.role
    );

    await notificationService.createNotification(
      updatedUser.id,
      'email_verified',
      'Email verified successfully',
      'Your email has been verified and your account is now active.'
    );

    return {
      token: jwtToken,
      user: updatedUser
    };
  }

  async forgotPassword(data: ForgotPasswordInput) {
    const { email } = data;

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
      }
    });

    if (!user) {
      return {
        message: 'If an account with this email exists, a password reset link has been sent.',
        resetSent: true
      };
    }

    const resetToken = nanoid(32);
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); 

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry,
      }
    });

    console.log(`Password reset link for ${email}: ${config.FRONTEND_URL}/reset-password?token=${resetToken}`);

    return {
      message: 'If an account with this email exists, a password reset link has been sent.',
      resetSent: true
    };
  }

  async resetPassword(data: ResetPasswordInput) {
    const { token, newPassword } = data;

    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          gte: new Date()
        }
      },
      select: {
        id: true,
        email: true,
        name: true,
      }
    });

    if (!user) {
      throw new ValidationError('Invalid or expired reset token');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      }
    });

    await notificationService.createNotification(
      user.id,
      'password_reset',
      'Password changed',
      'Your account password has been changed successfully.'
    );

    return {
      message: 'Password reset successfully. You can now login with your new password.'
    };
  }

  async logout(token: string) {
    try {
      const decoded = jwt.decode(token) as any;
      if (!decoded || !decoded.exp) {
        return { message: 'Logout successful' };
      }

      const currentTime = Math.floor(Date.now() / 1000);
      const ttl = decoded.exp - currentTime;

      if (ttl > 0) {
        await cacheService.addToBlacklist(token, ttl);
      }

      return { message: 'Logout successful' };
    } catch (error) {
      return { message: 'Logout successful' };
    }
  }

  generateTokenForOAuthUser(user: any): { token: string; user: any } {
    const token = this.generateToken(user.id, user.email, user.role);
    
    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
        hostel: user.hostel,
        block: user.block,
        roomNumber: user.roomNumber
      }
    };
  }
}

export const authService = new AuthService();