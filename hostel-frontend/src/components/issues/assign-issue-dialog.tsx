'use client';

import { useState } from 'react';
import { X, UserPlus } from 'lucide-react';
import { useAssignIssue } from '@/hooks/mutations/use-issue-mutations';
import { useStaffList, type StaffMember } from '@/hooks/queries/use-staff';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface AssignIssueDialogProps {
  issueId: string;
  issueTitle: string;
  isOpen: boolean;
  onClose: () => void;
}

export function AssignIssueDialog({
  issueId,
  issueTitle,
  isOpen,
  onClose,
}: AssignIssueDialogProps) {
  const [selectedStaffId, setSelectedStaffId] = useState<string>('');
  const [note, setNote] = useState('');
  const [deadline, setDeadline] = useState('');

  const assignIssue = useAssignIssue(issueId);
  const { data: staffList, isLoading } = useStaffList();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaffId) return;

    try {
      await assignIssue.mutateAsync({
        assignedToId: selectedStaffId,
        note: note || undefined,
        deadline: deadline || undefined,
      });
      handleClose();
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleClose = () => {
    setSelectedStaffId('');
    setNote('');
    setDeadline('');
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
              Assign Issue
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
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Select a staff member to assign this issue to.
          </p>

          {/* Staff Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Select Staff <span className="text-error-600">*</span>
            </label>
            {isLoading ? (
              <div className="skeleton h-10 w-full" />
            ) : staffList && staffList.length > 0 ? (
              <div className="max-h-60 space-y-2 overflow-y-auto">
                {staffList.map((staff: StaffMember) => (
                  <div
                    key={staff.id}
                    onClick={() => setSelectedStaffId(staff.id)}
                    className={cn(
                      'cursor-pointer rounded-lg border p-3 transition-colors',
                      selectedStaffId === staff.id
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-neutral-200 hover:border-neutral-300 dark:border-neutral-700 dark:hover:border-neutral-600'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-neutral-900 dark:text-neutral-100">
                          {staff.name}
                        </p>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                          {staff.role} {staff.specialization && `• ${staff.specialization}`}
                        </p>
                      </div>
                      {staff.assignedIssuesCount !== undefined && (
                        <span className="text-xs text-neutral-500">
                          {staff.assignedIssuesCount} issues
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-neutral-500">No staff members available</p>
            )}
          </div>

          {/* Note */}
          <div className="space-y-2">
            <label htmlFor="note" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Note (Optional)
            </label>
            <textarea
              id="note"
              rows={3}
              placeholder="Add any instructions or notes for the staff..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              disabled={assignIssue.isPending}
              className={cn(
                'w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm shadow-xs',
                'focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50',
                'disabled:cursor-not-allowed disabled:opacity-50',
                'dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100'
              )}
            />
          </div>

          {/* Deadline */}
          <div className="space-y-2">
            <label htmlFor="deadline" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Deadline (Optional)
            </label>
            <Input
              id="deadline"
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              disabled={assignIssue.isPending}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={assignIssue.isPending}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="btn-primary flex-1"
              disabled={assignIssue.isPending || !selectedStaffId}
            >
              {assignIssue.isPending ? (
                <>
                  <span className="spinner mr-2 h-4 w-4" />
                  Assigning...
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Assign
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
