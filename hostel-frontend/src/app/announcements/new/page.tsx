'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { ArrowLeft, Upload, Plus, Paperclip, X } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useHostels, useHostelBlocks } from '@/hooks/queries/use-hostels';
import { useCreateAnnouncement } from '@/hooks/mutations/use-announcement-mutations';
import { AppShell } from '@/components/layout';
import { ImageUploadPreview } from '@/components/issues/image-upload-preview';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createAnnouncementSchema, type CreateAnnouncementFormData } from '@/schemas/index';
import { cn } from '@/lib/utils';

// Must exactly match announcementCategoryEnum in schemas/announcement.schema.ts
const categories = [
  'CLEANING_SCHEDULE',
  'PEST_CONTROL',
  'MAINTENANCE_NOTICE',
  'WATER_ELECTRICITY',
  'GENERAL',
];

export default function CreateAnnouncementPage() {
  const router = useRouter();
  const { isManagement } = useAuth();
  const createAnnouncement = useCreateAnnouncement();
  const [images, setImages] = useState<File[]>([]);
  const [attachments, setAttachments] = useState<File[]>([]);

  // Redirect if not management
  useEffect(() => {
    if (!isManagement) {
      toast.error('Access denied', {
        description: 'Only management can create announcements',
      });
      router.push('/announcements');
    }
  }, [isManagement, router]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CreateAnnouncementFormData>({
    resolver: zodResolver(createAnnouncementSchema),
    defaultValues: {
      title: '',
      content: '',
      category: 'GENERAL' as const,
      priority: false,
      hostelId: '',
      blockIds: [],
      targetRoles: ['STUDENT' as const],
    },
  });

  const selectedHostelId = watch('hostelId');
  const { data: hostels } = useHostels();
  const { data: blocks } = useHostelBlocks(selectedHostelId as string);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    if (images.length + files.length > 3) {
      toast.error('Maximum 3 images allowed');
      return;
    }

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

  const handleAttachmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    if (attachments.length + files.length > 2) {
      toast.error('Maximum 2 attachments allowed');
      return;
    }

    const validFiles = files.filter((file) => {
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} is too large (max 10MB)`);
        return false;
      }
      if (file.type !== 'application/pdf') {
        toast.error(`${file.name} is not a PDF`);
        return false;
      }
      return true;
    });

    setAttachments((prev) => [...prev, ...validFiles]);
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: CreateAnnouncementFormData) => {
    try {
      // Destructure priority (boolean) out so we can convert it before spreading
      const { priority, hostelId, blockIds, ...rest } = data;
      await createAnnouncement.mutateAsync({
        ...rest,
        priority: priority ? 'HIGH' : 'MEDIUM',
        hostelId: hostelId || undefined,
        blockIds: blockIds && blockIds.length > 0 ? blockIds : undefined,
        images,
        attachments,
      });

      toast.success('Announcement created successfully!');
      router.push('/announcements');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create announcement');
    }
  };

  if (!isManagement) {
    return null;
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Back Button */}
        <Link href="/announcements">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Announcements
          </Button>
        </Link>

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-50">
            Create Announcement
          </h1>
          <p className="mt-2 text-neutral-600 dark:text-neutral-400">
            Share important information with residents
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit as any)} className="card space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <label htmlFor="title" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Title <span className="text-error-600">*</span>
            </label>
            <Input
              id="title"
              type="text"
              placeholder="Brief announcement title"
              {...register('title')}
              aria-invalid={!!errors.title}
              disabled={createAnnouncement.isPending}
            />
            {errors.title && (
              <p className="text-xs text-error-600 dark:text-error-400">
                {errors.title.message}
              </p>
            )}
          </div>

          {/* Content */}
          <div className="space-y-2">
            <label htmlFor="content" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Content <span className="text-error-600">*</span>
            </label>
            <textarea
              id="content"
              rows={8}
              placeholder="Write your announcement content here..."
              {...register('content')}
              disabled={createAnnouncement.isPending}
              className={cn(
                'w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm shadow-xs',
                'focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50',
                'disabled:cursor-not-allowed disabled:opacity-50',
                'dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100',
                errors.content && 'border-error-500'
              )}
            />
            {errors.content && (
              <p className="text-xs text-error-600 dark:text-error-400">
                {errors.content.message}
              </p>
            )}
          </div>

          {/* Category & Priority */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="category" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Category <span className="text-error-600">*</span>
              </label>
              <select
                id="category"
                {...register('category')}
                disabled={createAnnouncement.isPending}
                className={cn(
                  'w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm shadow-xs',
                  'focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50',
                  'disabled:cursor-not-allowed disabled:opacity-50',
                  'dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100'
                )}
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Priority
              </label>
              <label className="flex items-center gap-2 rounded-md border border-neutral-300 bg-white px-3 py-2.5 dark:border-neutral-700 dark:bg-neutral-900">
                <input
                  type="checkbox"
                  {...register('priority')}
                  disabled={createAnnouncement.isPending}
                  className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-2 focus:ring-primary-500"
                />
                <span className="text-sm text-neutral-700 dark:text-neutral-300">
                  Mark as High Priority
                </span>
              </label>
            </div>
          </div>

          {/* Target Roles */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Target Audience <span className="text-error-600">*</span>
            </label>
            <div className="flex flex-wrap gap-3">
              {['STUDENT', 'STAFF', 'MANAGEMENT'].map((role) => (
                <label key={role} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    value={role}
                    {...register('targetRoles')}
                    disabled={createAnnouncement.isPending}
                    className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-2 focus:ring-primary-500"
                  />
                  <span className="text-sm text-neutral-700 dark:text-neutral-300">
                    {role}
                  </span>
                </label>
              ))}
            </div>
            {errors.targetRoles && (
              <p className="text-xs text-error-600 dark:text-error-400">
                {errors.targetRoles.message}
              </p>
            )}
          </div>

          {/* Location - Hostel & Blocks */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="hostelId" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Hostel (Optional)
              </label>
              <select
                id="hostelId"
                {...register('hostelId')}
                disabled={createAnnouncement.isPending}
                className={cn(
                  'w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm shadow-xs',
                  'focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50',
                  'disabled:cursor-not-allowed disabled:opacity-50',
                  'dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100'
                )}
              >
                <option value="">All Hostels</option>
                {hostels?.map((hostel) => (
                  <option key={hostel.id} value={hostel.id}>
                    {hostel.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="blockIds" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Blocks (Optional)
              </label>
              <select
                id="blockIds"
                multiple
                {...register('blockIds')}
                disabled={createAnnouncement.isPending || !selectedHostelId}
                className={cn(
                  'w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm shadow-xs',
                  'focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50',
                  'disabled:cursor-not-allowed disabled:opacity-50',
                  'dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100'
                )}
                size={3}
              >
                {blocks?.map((block) => (
                  <option key={block.id} value={block.id}>
                    {block.name}
                  </option>
                ))}
              </select>
              {!selectedHostelId && (
                <p className="text-xs text-neutral-500">
                  Select a hostel first
                </p>
              )}
            </div>
          </div>

          {/* Images Upload */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Images (Optional - Max 3)
            </label>
            <div>
              <label
                htmlFor="images"
                className={cn(
                  'flex cursor-pointer items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors',
                  'border-neutral-300 hover:border-primary-400 dark:border-neutral-700 dark:hover:border-primary-600',
                  images.length >= 3 && 'cursor-not-allowed opacity-50'
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
                  disabled={createAnnouncement.isPending || images.length >= 3}
                  className="hidden"
                />
              </label>
            </div>
            <ImageUploadPreview images={images} onRemove={removeImage} />
          </div>

          {/* Attachments Upload */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Attachments (Optional - Max 2 PDFs)
            </label>
            <div>
              <label
                htmlFor="attachments"
                className={cn(
                  'flex cursor-pointer items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors',
                  'border-neutral-300 hover:border-primary-400 dark:border-neutral-700 dark:hover:border-primary-600',
                  attachments.length >= 2 && 'cursor-not-allowed opacity-50'
                )}
              >
                <div className="text-center">
                  <Paperclip className="mx-auto h-8 w-8 text-neutral-400" />
                  <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
                    Click to upload PDF files
                  </p>
                  <p className="mt-1 text-xs text-neutral-500">
                    PDF up to 10MB each
                  </p>
                </div>
                <input
                  id="attachments"
                  type="file"
                  accept="application/pdf"
                  multiple
                  onChange={handleAttachmentChange}
                  disabled={createAnnouncement.isPending || attachments.length >= 2}
                  className="hidden"
                />
              </label>
            </div>
            {attachments.length > 0 && (
              <div className="space-y-2">
                {attachments.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-lg border border-neutral-200 p-3 dark:border-neutral-700"
                  >
                    <div className="flex items-center gap-2">
                      <Paperclip className="h-4 w-4 text-neutral-500" />
                      <span className="text-sm text-neutral-700 dark:text-neutral-300">
                        {file.name}
                      </span>
                      <span className="text-xs text-neutral-500">
                        ({(file.size / 1024).toFixed(2)} KB)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeAttachment(index)}
                      className="rounded p-1 text-error-600 hover:bg-error-50 dark:hover:bg-error-950"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Link href="/announcements" className="flex-1">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                disabled={createAnnouncement.isPending}
              >
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              className="btn-primary flex-1"
              disabled={createAnnouncement.isPending}
            >
              {createAnnouncement.isPending ? (
                <>
                  <span className="spinner mr-2 h-4 w-4" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Announcement
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}