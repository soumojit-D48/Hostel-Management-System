import { cloudinary } from '../../config/cloudinary';
import sharp from 'sharp';
import { logger } from './logger.service';
import { config } from '../config/config';

interface UploadResult {
  url: string;
  thumbnailUrl?: string;
  publicId: string;
}

class UploadService {
  async uploadImage(file: Express.Multer.File): Promise<UploadResult> {
    try {
      
      let processedImage = sharp(file.buffer);
      
      
      const metadata = await processedImage.metadata();
      
      
      if (metadata.width && metadata.width > 2000) {
        processedImage = processedImage.resize(2000, null, {
          withoutEnlargement: true,
          fit: 'inside'
        });
      }
      
      
      const webpBuffer = await processedImage
        .webp({ quality: 85 })
        .toBuffer();
      
      
      const thumbnailBuffer = await sharp(file.buffer)
        .resize(300, null, {
          withoutEnlargement: true,
          fit: 'inside'
        })
        .webp({ quality: 80 })
        .toBuffer();
      
      
      const mainResult = await new Promise<any>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'hostel-images',
            resource_type: 'image',
            format: 'webp',
            quality: 'auto:good',
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        
        uploadStream.end(webpBuffer);
      });
      
      
      const thumbnailResult = await new Promise<any>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'hostel-thumbnails',
            resource_type: 'image',
            format: 'webp',
            quality: 'auto:good',
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        
        uploadStream.end(thumbnailBuffer);
      });
      
      return {
        url: mainResult.secure_url,
        thumbnailUrl: thumbnailResult.secure_url,
        publicId: mainResult.public_id,
      };
    } catch (error) {
      logger.error({
        message: 'Image upload failed',
        error: error instanceof Error ? {
          name: error.name,
          message: error.message,
          stack: error.stack,
        } : error,
        file: {
          originalname: file.originalname,
          size: file.size,
        },
      });
      throw new Error('Failed to upload image');
    }
  }

  async uploadVideo(file: Express.Multer.File): Promise<UploadResult> {
    try {
      const result = await new Promise<any>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'hostel-videos',
            resource_type: 'video',
            chunk_size: 6000000, 
            eager: [
              { format: 'mp4', transformation: { quality: 'auto', fetch_format: 'auto' } }
            ],
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        
        uploadStream.end(file.buffer);
      });
      
      return {
        url: result.secure_url,
        publicId: result.public_id,
      };
    } catch (error) {
      logger.error({
        message: 'Video upload failed',
        error: error instanceof Error ? {
          name: error.name,
          message: error.message,
          stack: error.stack,
        } : error,
        file: {
          originalname: file.originalname,
          size: file.size,
        },
      });
      throw new Error('Failed to upload video');
    }
  }

  async deleteFile(url: string): Promise<boolean> {
    try {
      const publicId = this.extractPublicIdFromUrl(url);
      if (!publicId) {
        logger.warn({ message: 'Could not extract public ID from URL', url });
        return false;
      }

      const result = await new Promise<any>((resolve, reject) => {
        cloudinary.uploader.destroy(publicId, (error, result) => {
          if (error) reject(error);
          else resolve(result);
        });
      });

      return result.result === 'ok';
    } catch (error) {
      logger.error({
        message: 'File deletion failed',
        error: error instanceof Error ? {
          name: error.name,
          message: error.message,
          stack: error.stack,
        } : error,
        url,
      });
      return false;
    }
  }

  private extractPublicIdFromUrl(url: string): string | null {
    try {
      
      
      
      const urlParts = url.split('/');
      const uploadIndex = urlParts.indexOf('upload');
      if (uploadIndex === -1) return null;
      
      const pathParts = urlParts.slice(uploadIndex + 1);
      const filenameWithExtension = pathParts.join('/');
      
      
      const lastDotIndex = filenameWithExtension.lastIndexOf('.');
      if (lastDotIndex !== -1) {
        return filenameWithExtension.substring(0, lastDotIndex);
      }
      
      return filenameWithExtension;
    } catch (error) {
      logger.error({
        message: 'Failed to extract public ID from URL',
        error,
        url,
      });
      return null;
    }
  }

  validateImage(file: Express.Multer.File): { valid: boolean; error?: string } {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    
    if (!allowedTypes.includes(file.mimetype)) {
      return { valid: false, error: 'Invalid image type. Only JPEG, PNG, and WebP are allowed.' };
    }
    
    if (file.size > config.MAX_IMAGE_SIZE) {
      return { 
        valid: false, 
        error: `Image size too large. Maximum size is ${config.MAX_IMAGE_SIZE / 1024 / 1024}MB.` 
      };
    }
    
    return { valid: true };
  }

  validateVideo(file: Express.Multer.File): { valid: boolean; error?: string } {
    const allowedTypes = ['video/mp4', 'video/mov', 'video/quicktime'];
    
    if (!allowedTypes.includes(file.mimetype)) {
      return { valid: false, error: 'Invalid video type. Only MP4 and MOV are allowed.' };
    }
    
    if (file.size > config.MAX_VIDEO_SIZE) {
      return { 
        valid: false, 
        error: `Video size too large. Maximum size is ${config.MAX_VIDEO_SIZE / 1024 / 1024}MB.` 
      };
    }
    
    return { valid: true };
  }
}

export const uploadService = new UploadService();