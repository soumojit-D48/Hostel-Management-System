import bcrypt from 'bcrypt';
import { nanoid } from 'nanoid';
import jwt, { SignOptions } from 'jsonwebtoken';
import { prisma } from '../../config/database';
import { Role } from '@prisma/client';
import { RegisterInput, VerifyEmailInput } from './auth.validation';
import { ValidationError, NotFoundError } from '../../shared/middleware/error.middleware';
import { config } from '../../shared/config/config';

class AuthService {
  private generateToken(userId: string, email: string, role: Role): string {
    const payload = { userId, email, role };
    const options: SignOptions = { expiresIn: config.JWT_EXPIRES_IN } as SignOptions;
    
    return jwt.sign(payload, config.JWT_SECRET, options);
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

    return {
      token: jwtToken,
      user: updatedUser
    };
  }
}

export const authService = new AuthService();