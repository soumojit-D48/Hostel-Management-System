'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { ArrowLeft, Upload, Plus } from 'lucide-react';
import { AppShell } from '@/components/layout';
import { ImageUploadPreview } from '@/components/issues/image-upload-preview';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createIssueSchema, type CreateIssueFormData } from '@/schemas/index';
import { apiUpload } from '@/lib/api-client';
import { cn } from '@/lib/utils';

// Must match issueCategoryEnum in schemas/issue.schema.ts
const categories = [
  'PLUMBING',
  'ELECTRICAL',
  'FURNITURE',
  'CLEANLINESS',
  'INTERNET',
  'SECURITY',
  'NOISE',
  'OTHER',
];

// Must match issuePriorityEnum in schemas/issue.schema.ts
const priorities = ['LOW', 'MEDIUM', 'HIGH', 'EMERGENCY'];

export default function CreateIssuePage() {
  const router = useRouter();
  const [images, setImages] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateIssueFormData>({
    resolver: zodResolver(createIssueSchema),
    defaultValues: {
      title: '',
      description: '',
      category: 'OTHER' as const,
      priority: 'MEDIUM' as const,
      visibility: 'PUBLIC',
      location: '',
      roomNumber: '',
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    // Validate total count
    if (images.length + files.length > 5) {
      toast.error('Maximum 5 images allowed');
      return;
    }

    // Validate file types and sizes
    const validFiles = files.filter((file) => {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is too large (max 5MB)`);
        return false;
      }
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image`);
        return false;
      }
      return true;
    });

    setImages((prev) => [...prev, ...validFiles]);
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: CreateIssueFormData) => {
    setIsSubmitting(true);
    try {
      // Create FormData
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('description', data.description);
      formData.append('category', data.category);
      formData.append('priority', data.priority);
      formData.append('visibility', data.visibility);
      if (data.location) formData.append('location', data.location);
      if (data.roomNumber) formData.append('roomNumber', data.roomNumber);

      // Append images
      images.forEach((image) => {
        formData.append('images', image);
      });

      // Submit — use apiUpload so the browser sets Content-Type with boundary automatically
      const response = await apiUpload<{ data: { id: string } }>('/issues', formData);

      toast.success('Issue created successfully!');
      router.push(`/issues/${response?.data?.id}`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to create issue');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl space-y-6">
        {/* Back Button */}
        <Link href="/issues">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Issues
          </Button>
        </Link>

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-50">
            Report New Issue
          </h1>
          <p className="mt-2 text-neutral-600 dark:text-neutral-400">
            Help us improve by reporting issues you encounter
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="card space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <label htmlFor="title" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Title <span className="text-error-600">*</span>
            </label>
            <Input
              id="title"
              type="text"
              placeholder="Brief summary of the issue"
              {...register('title')}
              aria-invalid={!!errors.title}
              disabled={isSubmitting}
            />
            {errors.title && (
              <p className="text-xs text-error-600 dark:text-error-400">
                {errors.title.message}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label htmlFor="description" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Description <span className="text-error-600">*</span>
            </label>
            <textarea
              id="description"
              rows={6}
              placeholder="Provide detailed information about the issue..."
              {...register('description')}
              disabled={isSubmitting}
              className={cn(
                'w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm shadow-xs',
                'focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50',
                'disabled:cursor-not-allowed disabled:opacity-50',
                'dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100',
                errors.description && 'border-error-500'
              )}
            />
            {errors.description && (
              <p className="text-xs text-error-600 dark:text-error-400">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Category, Priority, Visibility */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label htmlFor="category" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Category <span className="text-error-600">*</span>
              </label>
              <select
                id="category"
                {...register('category')}
                disabled={isSubmitting}
                className={cn(
                  'w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm shadow-xs',
                  'focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50',
                  'disabled:cursor-not-allowed disabled:opacity-50',
                  'dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100',
                  errors.category && 'border-error-500'
                )}
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="text-xs text-error-600 dark:text-error-400">
                  {errors.category.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="priority" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Priority <span className="text-error-600">*</span>
              </label>
              <select
                id="priority"
                {...register('priority')}
                disabled={isSubmitting}
                className={cn(
                  'w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm shadow-xs',
                  'focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50',
                  'disabled:cursor-not-allowed disabled:opacity-50',
                  'dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100',
                  errors.priority && 'border-error-500'
                )}
              >
                {priorities.map((pri) => (
                  <option key={pri} value={pri}>
                    {pri}
                  </option>
                ))}
              </select>
              {errors.priority && (
                <p className="text-xs text-error-600 dark:text-error-400">
                  {errors.priority.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="visibility" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Visibility <span className="text-error-600">*</span>
              </label>
              <select
                id="visibility"
                {...register('visibility')}
                disabled={isSubmitting}
                className={cn(
                  'w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm shadow-xs',
                  'focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50',
                  'disabled:cursor-not-allowed disabled:opacity-50',
                  'dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100'
                )}
              >
                <option value="PUBLIC">Public</option>
                <option value="PRIVATE">Private</option>
              </select>
            </div>
          </div>

          {/* Location & Room Number */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="location" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Location
              </label>
              <Input
                id="location"
                type="text"
                placeholder="e.g., Common Room, 2nd Floor"
                {...register('location')}
                disabled={isSubmitting}
              />
              {errors.location && (
                <p className="text-xs text-error-600 dark:text-error-400">
                  {errors.location.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="roomNumber" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Room Number
              </label>
              <Input
                id="roomNumber"
                type="text"
                placeholder="e.g., 101"
                {...register('roomNumber')}
                disabled={isSubmitting}
              />
              {errors.roomNumber && (
                <p className="text-xs text-error-600 dark:text-error-400">
                  {errors.roomNumber.message}
                </p>
              )}
            </div>
          </div>

          {/* Images Upload */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Images (Optional - Max 5)
            </label>

            <div>
              <label
                htmlFor="images"
                className={cn(
                  'flex cursor-pointer items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors',
                  'border-neutral-300 hover:border-primary-400 dark:border-neutral-700 dark:hover:border-primary-600',
                  images.length >= 5 && 'cursor-not-allowed opacity-50'
                )}
              >
                <div className="text-center">
                  <Upload className="mx-auto h-8 w-8 text-neutral-400" />
                  <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
                    Click to upload images
                  </p>
                  <p className="mt-1 text-xs text-neutral-500">
                    PNG, JPG, WEBP up to 5MB each
                  </p>
                </div>
                <input
                  id="images"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  disabled={isSubmitting || images.length >= 5}
                  className="hidden"
                />
              </label>
            </div>

            {/* Image Previews */}
            <ImageUploadPreview images={images} onRemove={removeImage} />
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Link href="/issues" className="flex-1">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              className="btn-primary flex-1"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner mr-2 h-4 w-4" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Issue
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}