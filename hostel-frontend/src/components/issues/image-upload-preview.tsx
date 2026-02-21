'use client';

import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageUploadPreviewProps {
  images: File[];
  onRemove: (index: number) => void;
}

export function ImageUploadPreview({ images, onRemove }: ImageUploadPreviewProps) {
  if (images.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
      {images.map((file, index) => (
        <div
          key={index}
          className="group relative aspect-square overflow-hidden rounded-lg bg-neutral-100 dark:bg-neutral-800"
        >
          <img
            src={URL.createObjectURL(file)}
            alt={`Preview ${index + 1}`}
            className="h-full w-full object-cover"
          />
          
          {/* Remove Button */}
          <button
            type="button"
            onClick={() => onRemove(index)}
            className={cn(
              'absolute right-2 top-2 rounded-full bg-error-600 p-1.5 text-white',
              'opacity-0 transition-opacity group-hover:opacity-100',
              'hover:bg-error-700'
            )}
          >
            <X className="h-4 w-4" />
          </button>

          {/* File Name */}
          <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-2 opacity-0 transition-opacity group-hover:opacity-100">
            <p className="truncate text-xs text-white">
              {file.name}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}