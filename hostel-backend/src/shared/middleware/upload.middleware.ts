import multer from 'multer';
import { Request, Response, NextFunction } from 'express';
import { uploadService } from '../services/upload.service';
import { ValidationError } from './error.middleware';

const storage = multer.memoryStorage();

const fileFilter = (req: Request, file: Express.Multer.File, cb: any): void => {
  const callback = cb as (error: any, acceptFile?: boolean) => void;
  try {
    if (file.mimetype.startsWith('image/')) {
      const validation = uploadService.validateImage(file);
      if (!validation.valid) {
        return callback(new ValidationError(validation.error || 'Invalid image file'), false);
      }
    } else if (file.mimetype.startsWith('video/')) {
      const validation = uploadService.validateVideo(file);
      if (!validation.valid) {
        return callback(new ValidationError(validation.error || 'Invalid video file'), false);
      }
    } else {
      return callback(new ValidationError('Invalid file type. Only images and videos are allowed.'), false);
    }
    
    callback(null, true);
  } catch (error) {
    callback(error, false);
  }
};

const limits = {
  fileSize: Math.max(
    parseInt(process.env.MAX_IMAGE_SIZE || '5242880', 10),
    parseInt(process.env.MAX_VIDEO_SIZE || '52428800', 10)
  ),
  files: 6,
};

export const upload = multer({
  storage,
  fileFilter,
  limits,
});

export const issueUpload = upload.fields([
  { name: 'images', maxCount: 5 },
  { name: 'videos', maxCount: 1 },
});

export const handleUploadError = (error: any, req: Request, res: Response, next: NextFunction) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      res.status(400).json({
        success: false,
        error: {
          code: 'FILE_TOO_LARGE',
          message: 'File size exceeds maximum allowed limit',
        },
      });
      return;
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      res.status(400).json({
        success: false,
        error: {
          code: 'TOO_MANY_FILES',
          message: 'Too many files uploaded',
        },
      });
      return;
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      res.status(400).json({
        success: false,
        error: {
          code: 'UNEXPECTED_FILE',
          message: 'Unexpected file field',
        },
      });
      return;
    }
  }
  
  if (error instanceof ValidationError) {
    res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: error.message,
      },
    });
    return;
  }
  
  next(error);
};

export const announcementUpload = upload.fields([
  { name: 'images', maxCount: 3 },
  { name: 'attachments', maxCount: 2 },
});

export const lostFoundUpload = upload.fields([
  { name: 'images', maxCount: 3 },
]);