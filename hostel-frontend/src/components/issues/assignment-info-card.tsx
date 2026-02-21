'use client';

import { Issue } from '@/types/issue.types';
import { UserCheck, Calendar, FileText, Clock } from 'lucide-react';
import { formatRelativeTime } from '@/lib/utils';

interface AssignmentInfoCardProps {
  issue: Issue;
}

export function AssignmentInfoCard({ issue }: AssignmentInfoCardProps) {
  if (!issue.assignedTo) {
    return null;
  }

  return (
    <div className="card border-l-4 border-info-600 dark:border-info-400">
      <div className="mb-4 flex items-center gap-2">
        <UserCheck className="h-5 w-5 text-info-600 dark:text-info-400" />
        <h3 className="font-semibold text-neutral-900 dark:text-neutral-50">
          Assignment Details
        </h3>
      </div>

      <div className="space-y-3">
        {/* Assigned Staff */}
        <div>
          <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
            Assigned To
          </p>
          <p className="mt-1 text-neutral-900 dark:text-neutral-50">
            {issue.assignedTo.name}
          </p>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            {issue.assignedTo.email}
          </p>
          {issue.assignedTo.phone && (
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              {issue.assignedTo.phone}
            </p>
          )}
        </div>

        {/* Assignment Date */}
        {issue.assignedAt && (
          <div className="flex items-start gap-2">
            <Calendar className="mt-0.5 h-4 w-4 text-neutral-500" />
            <div>
              <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                Assigned
              </p>
              <p className="text-sm text-neutral-900 dark:text-neutral-50">
                {formatRelativeTime(issue.assignedAt)}
                {issue.assignedBy && ` by ${issue.assignedBy.name}`}
              </p>
            </div>
          </div>
        )}

        {/* Deadline */}
        {issue.assignmentDeadline && (
          <div className="flex items-start gap-2">
            <Clock className="mt-0.5 h-4 w-4 text-neutral-500" />
            <div>
              <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                Deadline
              </p>
              <p className="text-sm text-neutral-900 dark:text-neutral-50">
                {new Date(issue.assignmentDeadline).toLocaleDateString()}
              </p>
            </div>
          </div>
        )}

        {/* Assignment Note */}
        {issue.assignmentNote && (
          <div className="flex items-start gap-2">
            <FileText className="mt-0.5 h-4 w-4 text-neutral-500" />
            <div>
              <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                Note
              </p>
              <p className="text-sm text-neutral-900 dark:text-neutral-50">
                {issue.assignmentNote}
              </p>
            </div>
          </div>
        )}

        {/* Status Progress */}
        <div className="mt-4 rounded-lg bg-neutral-50 p-3 dark:bg-neutral-800">
          <p className="text-xs font-medium uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
            Current Status
          </p>
          <p className="mt-1 text-sm font-semibold text-neutral-900 dark:text-neutral-50">
            {issue.status.replace('_', ' ')}
          </p>
        </div>
      </div>
    </div>
  );
}