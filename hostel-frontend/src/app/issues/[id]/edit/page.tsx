'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { ArrowLeft, Save } from 'lucide-react';
import { AppShell } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createIssueSchema, type CreateIssueFormData } from '@/schemas/index';
import { useUpdateIssue } from '@/hooks/mutations/use-issue-edit-delete';
import { useIssue } from '@/hooks/queries/use-issues';
import { cn } from '@/lib/utils';

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

const priorities = ['LOW', 'MEDIUM', 'HIGH', 'EMERGENCY'];

export default function EditIssuePage() {
  const params = useParams();
  const router = useRouter();
  const issueId = params.id as string;

  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: issue, isLoading } = useIssue(issueId);
  const updateIssue = useUpdateIssue(issueId);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
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

  useEffect(() => {
    if (issue) {
      reset({
        title: issue.title || '',
        description: issue.description || '',
        category: issue.category as any || 'OTHER',
        priority: issue.priority as any || 'MEDIUM',
        visibility: issue.visibility || 'PUBLIC',
        location: issue.location || '',
        roomNumber: issue.roomNumber || '',
      });
    }
  }, [issue, reset]);

  const onSubmit = async (data: CreateIssueFormData) => {
    setIsSubmitting(true);
    try {
      await updateIssue.mutateAsync({
        title: data.title,
        description: data.description,
        category: data.category,
        priority: data.priority,
        visibility: data.visibility,
        location: data.location || undefined,
        roomNumber: data.roomNumber || undefined,
      });

      toast.success('Issue updated successfully!');
      router.push(`/issues/${issueId}`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update issue');
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

  if (!issue) {
    return (
      <AppShell>
        <div className="mx-auto max-w-3xl text-center py-12">
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            Issue Not Found
          </h2>
          <p className="mt-2 text-neutral-600 dark:text-neutral-400">
            The issue you're looking for doesn't exist.
          </p>
          <Link href="/issues">
            <Button className="mt-4">Go to Issues</Button>
          </Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl space-y-6">
        <Link href={`/issues/${issueId}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Issue
          </Button>
        </Link>

        <div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-50">
            Edit Issue
          </h1>
          <p className="mt-2 text-neutral-600 dark:text-neutral-400">
            Update the issue details
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
              placeholder="Brief summary of the issue"
              {...register('title')}
              disabled={isSubmitting}
            />
            {errors.title && (
              <p className="text-xs text-error-600">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Description <span className="text-error-600">*</span>
            </label>
            <textarea
              id="description"
              rows={6}
              placeholder="Provide detailed information..."
              {...register('description')}
              disabled={isSubmitting}
              className={cn(
                'w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm',
                'dark:border-neutral-700 dark:bg-neutral-900',
                errors.description && 'border-error-500'
              )}
            />
            {errors.description && (
              <p className="text-xs text-error-600">{errors.description.message}</p>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label htmlFor="category">Category</label>
              <select id="category" {...register('category')} disabled={isSubmitting}>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="priority">Priority</label>
              <select id="priority" {...register('priority')} disabled={isSubmitting}>
                {priorities.map((pri) => (
                  <option key={pri} value={pri}>{pri}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="visibility">Visibility</label>
              <select id="visibility" {...register('visibility')} disabled={isSubmitting}>
                <option value="PUBLIC">Public</option>
                <option value="PRIVATE">Private</option>
              </select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="location">Location</label>
              <Input id="location" type="text" {...register('location')} disabled={isSubmitting} />
            </div>
            <div className="space-y-2">
              <label htmlFor="roomNumber">Room Number</label>
              <Input id="roomNumber" type="text" {...register('roomNumber')} disabled={isSubmitting} />
            </div>
          </div>

          <div className="flex gap-3">
            <Link href={`/issues/${issueId}`} className="flex-1">
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
