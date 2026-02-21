'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar, User, Download, MapPin, Users } from 'lucide-react';
import { useAnnouncement } from '@/hooks/queries/use-announcements';
import { useMarkAnnouncementRead } from '@/hooks/mutations/use-announcement-mutations';
import { AppShell } from '@/components/layout';
import { IssueImagesGallery } from '@/components/issues/issue-images-gallery';
import { CommentsSection } from '@/components/issues/comments-section';
import { ReactionsBar } from '@/components/issues/reactions-bar';
import { Button } from '@/components/ui/button';
import { formatRelativeTime } from '@/lib/utils';
import { cn } from '@/lib/utils';

const categoryColors = {
  GENERAL: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400',
  MAINTENANCE: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400',
  EVENTS: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400',
  RULES: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400',
  EMERGENCY: 'bg-error-100 text-error-700 dark:bg-error-950 dark:text-error-400',
  CLEANING_SCHEDULE: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400',
  PEST_CONTROL: 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400',
  MAINTENANCE_NOTICE: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400',
  WATER_ELECTRICITY: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-400',
};

const priorityColors = {
  LOW: 'badge-success',
  MEDIUM: 'badge-warning',
  HIGH: 'badge-error',
};

export default function AnnouncementDetailPage() {
  const params = useParams();
  const announcementId = params.id as string;

  const { data: announcement, isLoading } = useAnnouncement(announcementId);
  const markAsRead = useMarkAnnouncementRead(announcementId);

  // Auto mark as read when viewing
  useEffect(() => {
    if (announcement && !announcement.isRead) {
      markAsRead.mutate();
    }
  }, [announcement, markAsRead]);

  if (isLoading) {
    return (
      <AppShell>
        <div className="space-y-6">
          <div className="skeleton h-12 w-32" />
          <div className="skeleton h-64 rounded-xl" />
          <div className="skeleton h-96 rounded-xl" />
        </div>
      </AppShell>
    );
  }

  if (!announcement) {
    return (
      <AppShell>
        <div className="flex min-h-[400px] flex-col items-center justify-center text-center">
          <h2 className="mb-4 text-2xl font-bold text-neutral-900 dark:text-neutral-50">
            Announcement Not Found
          </h2>
          <p className="mb-6 text-neutral-600 dark:text-neutral-400">
            The announcement you're looking for doesn't exist or has been removed.
          </p>
          <Link href="/announcements">
            <Button className="btn-primary">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Announcements
            </Button>
          </Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Back Button */}
        <Link href="/announcements">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Announcements
          </Button>
        </Link>

        {/* Main Content */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Main Content (2/3) */}
          <div className="space-y-6 lg:col-span-2">
            {/* Header */}
            <div className="card">
              <h1 className="mb-4 text-3xl font-bold text-neutral-900 dark:text-neutral-50">
                {announcement.title}
              </h1>

              {/* Badges */}
              <div className="mb-4 flex flex-wrap gap-2">
                <span className={cn('badge', categoryColors[announcement.category])}>
                  {announcement.category.replace('_', ' ')}
                </span>
                <span className={cn('badge', priorityColors[announcement.priority])}>
                  {announcement.priority}
                </span>
                {!announcement.isRead && (
                  <span className="badge badge-info">NEW</span>
                )}
              </div>

              {/* Meta Info */}
              <div className="flex flex-wrap gap-4 text-sm text-neutral-600 dark:text-neutral-400">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>{announcement.createdBy.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{formatRelativeTime(announcement.createdAt)}</span>
                </div>
              </div>
            </div>

            {/* Images */}
            {announcement.images && announcement.images.length > 0 && (
              <div className="card">
                <h3 className="mb-4 text-lg font-semibold text-neutral-900 dark:text-neutral-50">
                  Images
                </h3>
                <IssueImagesGallery images={announcement.images} />
              </div>
            )}

            {/* Content */}
            <div className="card">
              <h3 className="mb-4 text-lg font-semibold text-neutral-900 dark:text-neutral-50">
                Content
              </h3>
              <div className="prose prose-neutral dark:prose-invert max-w-none">
                <p className="whitespace-pre-wrap text-neutral-700 dark:text-neutral-300">
                  {announcement.content}
                </p>
              </div>
            </div>

            {/* Attachments */}
            {announcement.attachments && announcement.attachments.length > 0 && (
              <div className="card">
                <h3 className="mb-4 text-lg font-semibold text-neutral-900 dark:text-neutral-50">
                  Attachments
                </h3>
                <div className="space-y-2">
                  {announcement.attachments.map((attachment, index) => (
                    <a
                      key={index}
                      href={attachment.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between rounded-lg border border-neutral-200 p-3 transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-800"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded bg-primary-100 dark:bg-primary-950">
                          <Download className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                        </div>
                        <div>
                          <p className="font-medium text-neutral-900 dark:text-neutral-50">
                            {attachment.name}
                          </p>
                          <p className="text-xs text-neutral-500">
                            {(attachment.size / 1024).toFixed(2)} KB
                          </p>
                        </div>
                      </div>
                      <Download className="h-5 w-5 text-neutral-400" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Reactions */}
            <div>
              <h3 className="mb-4 text-lg font-semibold text-neutral-900 dark:text-neutral-50">
                Reactions
              </h3>
              <ReactionsBar issueId={announcementId} />
            </div>

            {/* Comments */}
            <CommentsSection issueId={announcementId} />
          </div>

          {/* Right Column - Sidebar (1/3) */}
          <div className="space-y-6">
            {/* Target Audience */}
            {announcement.targetRoles && announcement.targetRoles.length > 0 && (
              <div className="card">
                <h3 className="mb-3 flex items-center gap-2 font-semibold text-neutral-900 dark:text-neutral-50">
                  <Users className="h-5 w-5" />
                  Target Audience
                </h3>
                <div className="flex flex-wrap gap-2">
                  {announcement.targetRoles.map((role) => (
                    <span
                      key={role}
                      className="rounded-full bg-primary-100 px-3 py-1 text-sm font-medium text-primary-700 dark:bg-primary-950 dark:text-primary-300"
                    >
                      {role}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Location Info */}
            {(announcement.hostel || announcement.blocks) && (
              <div className="card">
                <h3 className="mb-3 flex items-center gap-2 font-semibold text-neutral-900 dark:text-neutral-50">
                  <MapPin className="h-5 w-5" />
                  Location
                </h3>
                <div className="space-y-2 text-sm">
                  {announcement.hostel && (
                    <p className="text-neutral-700 dark:text-neutral-300">
                      <span className="font-medium">Hostel:</span> {announcement.hostel.name}
                    </p>
                  )}
                  {announcement.blocks && announcement.blocks.length > 0 && (
                    <div>
                      <p className="mb-1 font-medium text-neutral-700 dark:text-neutral-300">
                        Blocks:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {announcement.blocks.map((block) => (
                          <span
                            key={block.id}
                            className="rounded bg-neutral-100 px-2 py-1 text-xs text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
                          >
                            {block.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Posted By */}
            <div className="card">
              <h3 className="mb-3 font-semibold text-neutral-900 dark:text-neutral-50">
                Posted By
              </h3>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-950">
                  <User className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <p className="font-medium text-neutral-900 dark:text-neutral-50">
                    {announcement.createdBy.name}
                  </p>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400">
                    {announcement.createdBy.email}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}