'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface IssueImagesGalleryProps {
  images: string[];
}

export function IssueImagesGallery({ images }: IssueImagesGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  if (!images || images.length === 0) {
    return null;
  }

  return (
    <>
      {/* Gallery Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {images.map((image, index) => (
          <div
            key={index}
            className="group relative aspect-video cursor-pointer overflow-hidden rounded-lg bg-neutral-100 dark:bg-neutral-800"
            onClick={() => setSelectedImage(image)}
          >
            <img
              src={image}
              alt={`Issue image ${index + 1}`}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-black/0 transition-all duration-300 group-hover:bg-black/20" />
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
            onClick={() => setSelectedImage(null)}
          >
            <X className="h-6 w-6" />
          </button>
          <img
            src={selectedImage}
            alt="Full size"
            className="max-h-[90vh] max-w-full rounded-lg object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}