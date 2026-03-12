'use client';

import { Issue } from '@/types/issue.types';
import { useAuth } from '@/hooks/use-auth';
import { Edit, UserPlus, CheckCircle, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { formatRelativeTime } from '@/lib/utils';

interface IssueHeaderProps {
  issue: Issue;
  onEdit?: () => void;
  onAssign?: () => void;
  onUpdateStatus?: () => void;
  onDelete?: () => void;
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
  EMERGENCY: 'badge-error',
};

const categoryColors = {
  PLUMBING: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400',
  ELECTRICAL: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400',
  FURNITURE: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400',
  CLEANLINESS: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400',
  INTERNET: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400',
  SECURITY: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400',
  NOISE: 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400',
  OTHER: 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-400',
};

export function IssueHeader({
  issue,
  onEdit,
  onAssign,
  onUpdateStatus,
  onDelete,
}: IssueHeaderProps) {
  const { user, isManagement, isStaffOrManagement } = useAuth();

  const canEdit = user?.id === issue.reportedBy.id || isManagement;
  const canAssign = isStaffOrManagement;
  const canUpdateStatus = 
    (issue.assignedTo?.id === user?.id) || isManagement;
  const canDelete = isManagement;

  return (
    <div className="space-y-4">
      {/* Title */}
      <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-50">
        {issue.title}
      </h1>

      {/* Badges */}
      <div className="flex flex-wrap gap-2">
        <span className={cn('badge', statusColors[issue.status])}>
          {issue.status.replace('_', ' ')}
        </span>
        <span className={cn('badge', priorityColors[issue.priority])}>
          {issue.priority}
        </span>
        <span className={cn('badge', categoryColors[issue.category])}>
          {issue.category}
        </span>
        {issue.visibility === 'PRIVATE' && (
          <span className="badge badge-error">PRIVATE</span>
        )}
      </div>

      {/* Meta Info */}
      <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-600 dark:text-neutral-400">
        <div>
          <span className="font-medium">Reported by:</span>{' '}
          {issue.reportedBy.name}
        </div>
        <div>
          <span className="font-medium">Date:</span>{' '}
          {formatRelativeTime(issue.createdAt)}
        </div>
        <div>
          <span className="font-medium">Location:</span>{' '}
          {issue.hostel.name}
          {issue.block && ` - ${issue.block.name}`}
          {issue.roomNumber && ` #${issue.roomNumber}`}
        </div>
      </div>

      {/* Assignment Info */}
      {issue.assignedTo && (
        <div className="rounded-lg bg-info-50 p-3 dark:bg-info-950">
          <p className="text-sm text-info-800 dark:text-info-200">
            <span className="font-medium">Assigned to:</span>{' '}
            {issue.assignedTo.name}
            {issue.assignedBy && (
              <span> by {issue.assignedBy.name}</span>
            )}
            {issue.assignedAt && (
              <span> on {new Date(issue.assignedAt).toLocaleDateString()}</span>
            )}
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        {canEdit && onEdit && (
          <Button variant="outline" size="sm" onClick={onEdit}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
        )}
        {canAssign && onAssign && issue.status !== 'CLOSED' && (
          <Button variant="outline" size="sm" onClick={onAssign}>
            <UserPlus className="mr-2 h-4 w-4" />
            {issue.assignedTo ? 'Reassign' : 'Assign'}
          </Button>
        )}
        {canUpdateStatus && onUpdateStatus && issue.status !== 'CLOSED' && (
          <Button variant="outline" size="sm" onClick={onUpdateStatus}>
            <CheckCircle className="mr-2 h-4 w-4" />
            Update Status
          </Button>
        )}
        {canDelete && onDelete && (
          <Button variant="destructive" size="sm" onClick={onDelete}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        )}
      </div>
    </div>
  );
}