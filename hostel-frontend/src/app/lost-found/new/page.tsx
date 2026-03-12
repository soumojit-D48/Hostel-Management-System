'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { ArrowLeft, Upload, Plus } from 'lucide-react';
import { useCreateLostFound } from '@/hooks/mutations/use-lost-found-mutations';
import { AppShell } from '@/components/layout';
import { ImageUploadPreview } from '@/components/issues/image-upload-preview';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createLostFoundSchema, type CreateLostFoundFormData } from '@/schemas/lost-found.schema';
import { cn } from '@/lib/utils';

const categories = ['ELECTRONICS', 'CLOTHING', 'BOOKS', 'ACCESSORIES', 'DOCUMENTS', 'KEYS', 'OTHER'];

export default function CreateLostFoundPage() {
  const router = useRouter();
  const createItem = useCreateLostFound();
  const [images, setImages] = useState<File[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateLostFoundFormData>({
    resolver: zodResolver(createLostFoundSchema),
    defaultValues: {
      itemName: '',
      description: '',
      category: 'OTHER',
      status: 'LOST',
      location: '',
      date: new Date().toISOString().split('T')[0],
    },
  });

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

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: CreateLostFoundFormData) => {
    try {
      const result = await createItem.mutateAsync({
        ...data,
        images,
      });

      toast.success('Item reported successfully!');
      
      // Show potential matches if any
      if (result.potentialMatches && result.potentialMatches.length > 0) {
        toast.info(`Found ${result.potentialMatches.length} potential match(es)!`, {
          description: 'Check the lost & found list to see if any match your item.',
        });
      }

      router.push(`/lost-found/${result.item.id}`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to report item');
    }
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl space-y-6">
        <Link href="/lost-found">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Lost & Found
          </Button>
        </Link>

        <div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-50">
            Report Lost/Found Item
          </h1>
          <p className="mt-2 text-neutral-600 dark:text-neutral-400">
            Help others find their belongings or claim what you've found
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="card space-y-6">
          {/* Status Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              I want to report <span className="text-error-600">*</span>
            </label>
            <div className="grid gap-3 md:grid-cols-2">
              <label className={cn(
                'flex cursor-pointer items-center gap-3 rounded-lg border-2 p-4 transition-colors',
                'border-neutral-200 hover:border-primary-400 dark:border-neutral-700 dark:hover:border-primary-600'
              )}>
                <input
                  type="radio"
                  value="LOST"
                  {...register('status')}
                  disabled={createItem.isPending}
                  className="h-4 w-4"
                />
                <div>
                  <p className="font-medium text-neutral-900 dark:text-neutral-50">Lost Item</p>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400">
                    I lost something
                  </p>
                </div>
              </label>

              <label className={cn(
                'flex cursor-pointer items-center gap-3 rounded-lg border-2 p-4 transition-colors',
                'border-neutral-200 hover:border-primary-400 dark:border-neutral-700 dark:hover:border-primary-600'
              )}>
                <input
                  type="radio"
                  value="FOUND"
                  {...register('status')}
                  disabled={createItem.isPending}
                  className="h-4 w-4"
                />
                <div>
                  <p className="font-medium text-neutral-900 dark:text-neutral-50">Found Item</p>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400">
                    I found something
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Item Name */}
          <div className="space-y-2">
            <label htmlFor="itemName" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Item Name <span className="text-error-600">*</span>
            </label>
            <Input
              id="itemName"
              type="text"
              placeholder="e.g., Black iPhone 13, Red Backpack"
              {...register('itemName')}
              aria-invalid={!!errors.itemName}
              disabled={createItem.isPending}
            />
            {errors.itemName && (
              <p className="text-xs text-error-600 dark:text-error-400">
                {errors.itemName.message}
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
              rows={4}
              placeholder="Describe the item in detail (brand, color, unique features, etc.)"
              {...register('description')}
              disabled={createItem.isPending}
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

          {/* Category, Location, Date */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label htmlFor="category" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Category <span className="text-error-600">*</span>
              </label>
              <select
                id="category"
                {...register('category')}
                disabled={createItem.isPending}
                className={cn(
                  'w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm shadow-xs',
                  'focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50',
                  'disabled:cursor-not-allowed disabled:opacity-50',
                  'dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100'
                )}
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="location" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Location <span className="text-error-600">*</span>
              </label>
              <Input
                id="location"
                type="text"
                placeholder="Where?"
                {...register('location')}
                aria-invalid={!!errors.location}
                disabled={createItem.isPending}
              />
              {errors.location && (
                <p className="text-xs text-error-600 dark:text-error-400">
                  {errors.location.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="date" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Date <span className="text-error-600">*</span>
              </label>
              <Input
                id="date"
                type="date"
                {...register('date')}
                aria-invalid={!!errors.date}
                disabled={createItem.isPending}
              />
              {errors.date && (
                <p className="text-xs text-error-600 dark:text-error-400">
                  {errors.date.message}
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
                  disabled={createItem.isPending || images.length >= 3}
                  className="hidden"
                />
              </label>
            </div>
            <ImageUploadPreview images={images} onRemove={removeImage} />
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Link href="/lost-found" className="flex-1">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                disabled={createItem.isPending}
              >
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              className="btn-primary flex-1"
              disabled={createItem.isPending}
            >
              {createItem.isPending ? (
                <>
                  <span className="spinner mr-2 h-4 w-4" />
                  Reporting...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Report Item
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}