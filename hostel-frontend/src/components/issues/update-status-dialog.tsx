'use client';

import { useState } from 'react';
import { X, CheckCircle } from 'lucide-react';
import { useUpdateIssueStatus } from '@/hooks/mutations/use-update-issue-status';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type IssueStatus = 'REPORTED' | 'ASSIGNED' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';

interface UpdateStatusDialogProps {
  issueId: string;
  issueTitle: string;
  currentStatus: IssueStatus;
  isAssignedToCurrentUser: boolean;
  isOpen: boolean;
  onClose: () => void;
}

const statusFlow: Record<IssueStatus, IssueStatus[]> = {
  REPORTED: ['ASSIGNED'],
  ASSIGNED: ['IN_PROGRESS', 'REPORTED'],
  IN_PROGRESS: ['RESOLVED', 'ASSIGNED'],
  RESOLVED: ['CLOSED', 'IN_PROGRESS'],
  CLOSED: ['REPORTED'],
};

const statusLabels: Record<IssueStatus, string> = {
  REPORTED: 'Reported',
  ASSIGNED: 'Assigned',
  IN_PROGRESS: 'In Progress',
  RESOLVED: 'Resolved',
  CLOSED: 'Closed',
};

const statusDescriptions: Record<IssueStatus, string> = {
  REPORTED: 'Issue has been reported',
  ASSIGNED: 'Issue has been assigned to a staff member',
  IN_PROGRESS: 'Staff is working on the issue',
  RESOLVED: 'Issue has been resolved',
  CLOSED: 'Issue is closed and resolved',
};

export function UpdateStatusDialog({
  issueId,
  issueTitle,
  currentStatus,
  isAssignedToCurrentUser,
  isOpen,
  onClose,
}: UpdateStatusDialogProps) {
  const [selectedStatus, setSelectedStatus] = useState<IssueStatus | ''>('');
  const [remarks, setRemarks] = useState('');

  const { user } = useAuth();
  const isManagement = user?.role === 'MANAGEMENT';
  
  const updateStatus = useUpdateIssueStatus(issueId);

  const availableStatuses = statusFlow[currentStatus]?.filter((status) => {
    // Management can do most transitions
    if (isManagement) return true;
    
    // Staff can only move to IN_PROGRESS or RESOLVED
    if (status === 'IN_PROGRESS' || status === 'RESOLVED') {
      return isAssignedToCurrentUser;
    }
    
    return false;
  }) || [];

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStatus) return;

    try {
      await updateStatus.mutateAsync({
        status: selectedStatus,
        remarks: remarks || undefined,
      });
      handleClose();
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleClose = () => {
    setSelectedStatus('');
    setRemarks('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} />
      
      <div className="modal-content relative z-10 w-full max-w-lg">
        <div className="flex items-center justify-between border-b border-neutral-200 p-6 dark:border-neutral-700">
          <div>
            <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-50">
              Update Status
            </h2>
            <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400 truncate">
              {issueTitle}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="rounded-lg p-2 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-4">
          {/* Current Status */}
          <div className="rounded-lg bg-neutral-100 p-3 dark:bg-neutral-800">
            <p className="text-sm text-neutral-500 dark:text-neutral-400">Current Status</p>
            <p className="font-medium text-neutral-900 dark:text-neutral-100">
              {statusLabels[currentStatus]}
            </p>
          </div>

          {/* Status Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              New Status <span className="text-error-600">*</span>
            </label>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              {!isManagement && isAssignedToCurrentUser 
                ? 'As staff, you can only mark as In Progress or Resolved'
                : !isManagement 
                  ? 'Only assigned staff or management can update status'
                  : 'Select the new status for this issue'
              }
            </p>
            <div className="space-y-2">
              {availableStatuses.length > 0 ? (
                availableStatuses.map((status) => (
                  <div
                    key={status}
                    onClick={() => setSelectedStatus(status)}
                    className={cn(
                      'cursor-pointer rounded-lg border p-3 transition-colors',
                      selectedStatus === status
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-neutral-200 hover:border-neutral-300 dark:border-neutral-700 dark:hover:border-neutral-600'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <CheckCircle className={cn(
                        'h-5 w-5',
                        selectedStatus === status 
                          ? 'text-primary-600 dark:text-primary-400' 
                          : 'text-neutral-400'
                      )} />
                      <div>
                        <p className="font-medium text-neutral-900 dark:text-neutral-100">
                          {statusLabels[status]}
                        </p>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                          {statusDescriptions[status]}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-neutral-500 p-3">
                  No status changes available for you
                </p>
              )}
            </div>
          </div>

          {/* Remarks */}
          <div className="space-y-2">
            <label htmlFor="remarks" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Remarks (Optional)
            </label>
            <textarea
              id="remarks"
              rows={3}
              placeholder="Add any remarks about this status change..."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              disabled={updateStatus.isPending}
              className={cn(
                'w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm shadow-xs',
                'focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50',
                'disabled:cursor-not-allowed disabled:opacity-50',
                'dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100'
              )}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={updateStatus.isPending}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="btn-primary flex-1"
              disabled={updateStatus.isPending || !selectedStatus}
            >
              {updateStatus.isPending ? (
                <>
                  <span className="spinner mr-2 h-4 w-4" />
                  Updating...
                </>
              ) : (
                'Update Status'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
