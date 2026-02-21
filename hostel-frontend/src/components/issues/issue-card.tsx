'use client';

import Link from 'next/link';
import { Issue } from '@/types/issue.types';
import { formatRelativeTime } from '@/lib/utils';
import { MessageSquare, ThumbsUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface IssueCardProps {
  issue: Issue;
}

const statusColors = {
  REPORTED: 'badge-info',
  ASSIGNED: 'badge-info',
  IN_PROGRESS: 'badge-info',
  RESOLVED: 'badge-success',
  CLOSED: 'badge',
};

const priorityColors = {
  LOW: 'badge-success',
  MEDIUM: 'badge-warning',
  HIGH: 'badge-error',
  URGENT: 'badge-error',
};

const categoryColors = {
  PLUMBING: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400',
  ELECTRICAL: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400',
  FURNITURE: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400',
  CLEANING: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400',
  INTERNET: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400',
  SECURITY: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400',
  OTHER: 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-400',
};

export function IssueCard({ issue }: IssueCardProps) {
  return (
    <Link href={`/issues/${issue.id}`}>
      <div className={cn(
        'card cursor-pointer transition-all duration-200',
        'hover:shadow-lg hover:-translate-y-1'
      )}>
        {/* Header */}
        <div className="mb-3 flex items-start justify-between gap-2">
          <h3 className="line-clamp-2 flex-1 text-lg font-semibold text-neutral-900 dark:text-neutral-50">
            {issue.title}
          </h3>
          {issue.priority && (
            <span className={cn('badge text-xs', priorityColors[issue.priority])}>
              {issue.priority}
            </span>
          )}
        </div>

        {/* Badges */}
        <div className="mb-3 flex flex-wrap gap-2">
          <span className={cn('badge text-xs', statusColors[issue.status])}>
            {issue.status.replace('_', ' ')}
          </span>
          <span className={cn('badge text-xs', categoryColors[issue.category])}>
            {issue.category}
          </span>
          {issue.visibility === 'PRIVATE' && (
            <span className="badge badge-error text-xs">PRIVATE</span>
          )}
        </div>

        {/* Description Preview */}
        <p className="truncate-2 mb-4 text-sm text-neutral-600 dark:text-neutral-400">
          {issue.description}
        </p>

        {/* Meta Info */}
        <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
          <div className="flex items-center gap-2">
            <span>By {issue.reportedBy.name}</span>
            <span>•</span>
            <span>{formatRelativeTime(issue.createdAt)}</span>
          </div>
          
          {issue.hostel && (
            <span className="truncate">
              {issue.hostel.name}
              {issue.block && ` - ${issue.block.name}`}
              {issue.roomNumber && ` #${issue.roomNumber}`}
            </span>
          )}
        </div>

        {/* Footer: Images indicator */}
        {issue.images && issue.images.length > 0 && (
          <div className="mt-3 flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
            <span>📷 {issue.images.length} {issue.images.length === 1 ? 'image' : 'images'}</span>
          </div>
        )}
      </div>
    </Link>
  );
}