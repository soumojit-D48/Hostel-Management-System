'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { ArrowLeft, Save } from 'lucide-react';
import { useAnnouncement } from '@/hooks/queries/use-announcements';
import { useUpdateAnnouncement } from '@/hooks/mutations/use-announcement-mutations';
import { AppShell } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createAnnouncementSchema, type CreateAnnouncementFormData } from '@/schemas/index';
import { cn } from '@/lib/utils';

const categories = [
  'CLEANING_SCHEDULE',
  'PEST_CONTROL',
  'MAINTENANCE_NOTICE',
  'WATER_ELECTRICITY',
  'GENERAL',
];

export default function EditAnnouncementPage() {
  const params = useParams();
  const router = useRouter();
  const announcementId = params.id as string;

  const { data: announcement, isLoading } = useAnnouncement(announcementId);
  const updateAnnouncement = useUpdateAnnouncement(announcementId);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateAnnouncementFormData>({
    resolver: zodResolver(createAnnouncementSchema),
    defaultValues: {
      title: '',
      content: '',
      category: 'GENERAL',
      priority: 'MEDIUM',
      targetRoles: ['STUDENT'],
    },
  });

  useEffect(() => {
    if (announcement) {
      reset({
        title: announcement.title || '',
        content: announcement.content || '',
        category: announcement.category as any || 'GENERAL',
        priority: announcement.priority || false,
        targetRoles: announcement.targetRoles as any || ['STUDENT'],
      });
    }
  }, [announcement, reset]);

  const onSubmit = async (data: CreateAnnouncementFormData) => {
    setIsSubmitting(true);
    try {
      await updateAnnouncement.mutateAsync({
        title: data.title,
        content: data.content,
        category: data.category,
        priority: data.priority || false,
        targetRoles: data.targetRoles,
      });

      toast.success('Announcement updated successfully!');
      router.push(`/announcements/${announcementId}`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update announcement');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <AppShell>
        <div className="mx-auto max-w-3xl space-y-6">
          <div className="skeleton h-12 w-32" />
          <div className="skeleton h-96 rounded-xl" />
        </div>
      </AppShell>
    );
  }

  if (!announcement) {
    return (
      <AppShell>
        <div className="mx-auto max-w-3xl text-center py-12">
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            Announcement Not Found
          </h2>
          <p className="mt-2 text-neutral-600 dark:text-neutral-400">
            The announcement you're looking for doesn't exist.
          </p>
          <Link href="/announcements">
            <Button className="mt-4">Go to Announcements</Button>
          </Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl space-y-6">
        <Link href={`/announcements/${announcementId}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Announcement
          </Button>
        </Link>

        <div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-50">
            Edit Announcement
          </h1>
          <p className="mt-2 text-neutral-600 dark:text-neutral-400">
            Update the announcement details
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="card space-y-6">
          <div className="space-y-2">
            <label htmlFor="title" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Title <span className="text-error-600">*</span>
            </label>
            <Input
              id="title"
              type="text"
              placeholder="Announcement title"
              {...register('title')}
              disabled={isSubmitting}
            />
            {errors.title && (
              <p className="text-xs text-error-600">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="content" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Content <span className="text-error-600">*</span>
            </label>
            <textarea
              id="content"
              rows={8}
              placeholder="Announcement content..."
              {...register('content')}
              disabled={isSubmitting}
              className={cn(
                'w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm',
                'dark:border-neutral-700 dark:bg-neutral-900',
                errors.content && 'border-error-500'
              )}
            />
            {errors.content && (
              <p className="text-xs text-error-600">{errors.content.message}</p>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="category">Category</label>
              <select id="category" {...register('category')} disabled={isSubmitting}>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat.replace('_', ' ')}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 rounded-md border border-neutral-300 bg-white px-3 py-2.5 dark:border-neutral-700 dark:bg-neutral-900">
                <input
                  type="checkbox"
                  {...register('priority')}
                  disabled={isSubmitting}
                  className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-2 focus:ring-primary-500"
                />
                <span className="text-sm text-neutral-700 dark:text-neutral-300">
                  Mark as High Priority
                </span>
              </label>
            </div>
          </div>

          <div className="flex gap-3">
            <Link href={`/announcements/${announcementId}`} className="flex-1">
              <Button type="button" variant="outline" className="w-full" disabled={isSubmitting}>
                Cancel
              </Button>
            </Link>
            <Button type="submit" className="btn-primary flex-1" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
