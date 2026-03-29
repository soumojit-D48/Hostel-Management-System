import dotenv from 'dotenv';

dotenv.config();

export const config = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '5000', 10),
  API_VERSION: process.env.API_VERSION || 'v1',

  DATABASE_URL: process.env.DATABASE_URL || '',
  DATABASE_URL_POOLED: process.env.DATABASE_URL_POOLED || '',

  REDIS_URL: process.env.REDIS_URL || '',

  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || '',
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || '',
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || '',

  JWT_SECRET: process.env.JWT_SECRET || '',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || '',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '30d',

  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || '',
  GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL || '',

  SMTP_HOST: process.env.SMTP_HOST || 'smtp.gmail.com',
  SMTP_PORT: parseInt(process.env.SMTP_PORT || '587', 10),
  SMTP_SECURE: process.env.SMTP_SECURE === 'true',
  SMTP_USER: process.env.SMTP_USER || '',
  SMTP_PASS: process.env.SMTP_PASS || '',

  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
  BACKEND_URL: process.env.BACKEND_URL || 'http://localhost:5000',

  SENTRY_DSN: process.env.SENTRY_DSN || '',

  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
  RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),

  MAX_IMAGE_SIZE: parseInt(process.env.MAX_IMAGE_SIZE || '5242880', 10),
  MAX_VIDEO_SIZE: parseInt(process.env.MAX_VIDEO_SIZE || '52428800', 10),
  MAX_IMAGES_PER_ISSUE: parseInt(process.env.MAX_IMAGES_PER_ISSUE || '5', 10),
  MAX_VIDEOS_PER_ISSUE: parseInt(process.env.MAX_VIDEOS_PER_ISSUE || '1', 10),
  MAX_IMAGES_PER_ANNOUNCEMENT: parseInt(process.env.MAX_IMAGES_PER_ANNOUNCEMENT || '3', 10),
  MAX_ATTACHMENTS_PER_ANNOUNCEMENT: parseInt(process.env.MAX_ATTACHMENTS_PER_ANNOUNCEMENT || '2', 10),

  BULLMQ_REDIS_URL: process.env.BULLMQ_REDIS_URL || process.env.REDIS_URL || 'redis://localhost:6379',

  SOCKET_CORS_ORIGIN: process.env.SOCKET_CORS_ORIGIN || 'http://localhost:3000',
};

if (!config.DATABASE_URL) {
  throw new Error('DATABASE_URL is required');
}

if (!config.JWT_SECRET || config.JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET must be at least 32 characters long');
}

if (!config.JWT_REFRESH_SECRET || config.JWT_REFRESH_SECRET.length < 32) {
  throw new Error('JWT_REFRESH_SECRET must be at least 32 characters long');
}