'use client';

import Link from 'next/link';
import { Announcement } from '@/types/announcement.types';
import { formatRelativeTime } from '@/lib/utils';
import { Megaphone, Calendar, Pin, Paperclip } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AnnouncementCardProps {
  announcement: Announcement;
}

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

export function AnnouncementCard({ announcement }: AnnouncementCardProps) {
  const isUnread = !announcement.isRead;

  return (
    <Link href={`/announcements/${announcement.id}`}>
      <div className={cn(
        'card cursor-pointer transition-all duration-200',
        'hover:shadow-lg hover:-translate-y-1',
        announcement.priority && 'border-l-4 border-error-600 dark:border-error-400',
        isUnread && 'ring-2 ring-primary-200 dark:ring-primary-800'
      )}>
        {/* Header */}
        <div className="mb-3 flex items-start gap-3">
          <div className="flex-shrink-0">
            <div className={cn(
              'flex h-10 w-10 items-center justify-center rounded-lg',
              announcement.priority 
                ? 'bg-error-100 dark:bg-error-950' 
                : 'bg-primary-100 dark:bg-primary-950'
            )}>
              {announcement.priority ? (
                <Pin className="h-5 w-5 text-error-600 dark:text-error-400" />
              ) : (
                <Megaphone className="h-5 w-5 text-primary-600 dark:text-primary-400" />
              )}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <h3 className={cn(
              'line-clamp-2 text-lg text-neutral-900 dark:text-neutral-50',
              isUnread ? 'font-bold' : 'font-semibold'
            )}>
              {announcement.title}
            </h3>
          </div>
        </div>

        {/* Badges */}
        <div className="mb-3 flex flex-wrap gap-2">
          <span className={cn('badge text-xs', categoryColors[announcement.category])}>
            {announcement.category.replace('_', ' ')}
          </span>
          <span className={cn('badge text-xs', announcement.priority ? 'badge-error' : 'badge-success')}>
            {announcement.priority ? 'HIGH' : 'Normal'}
          </span>
          {isUnread && (
            <span className="badge badge-info text-xs">NEW</span>
          )}
        </div>

        {/* Content Preview */}
        <p className="truncate-3 mb-4 text-sm text-neutral-600 dark:text-neutral-400">
          {announcement.content}
        </p>

        {/* Target Roles */}
        {announcement.targetRoles && announcement.targetRoles.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-1">
            {announcement.targetRoles.map((role) => (
              <span
                key={role}
                className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
              >
                {role}
              </span>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
          <div className="flex items-center gap-2">
            <Calendar className="h-3.5 w-3.5" />
            <span>{formatRelativeTime(announcement.createdAt)}</span>
          </div>

          <div className="flex items-center gap-3">
            {announcement.images && announcement.images.length > 0 && (
              <span>📷 {announcement.images.length}</span>
            )}
            {announcement.attachments && announcement.attachments.length > 0 && (
              <div className="flex items-center gap-1">
                <Paperclip className="h-3.5 w-3.5" />
                <span>{announcement.attachments.length}</span>
              </div>
            )}
          </div>
        </div>

        {/* Location Info */}
        {(announcement.hostel || announcement.blocks) && (
          <div className="mt-3 text-xs text-neutral-500 dark:text-neutral-400">
            {announcement.hostel && (
              <span>
                {announcement.hostel.name}
                {announcement.blocks && announcement.blocks.length > 0 && 
                  ` - ${announcement.blocks.map(b => b.name).join(', ')}`
                }
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}