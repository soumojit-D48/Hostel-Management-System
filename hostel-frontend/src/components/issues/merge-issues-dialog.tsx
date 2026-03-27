'use client';

import { useState } from 'react';
import { X, GitMerge, Check } from 'lucide-react';
import { useMergeIssues } from '@/hooks/mutations/use-issue-mutations';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SimilarIssue {
  issueId: string;
  title: string;
  category: string;
  similarityScore: number;
}

interface MergeIssuesDialogProps {
  issueId: string;
  issueTitle: string;
  similarIssues: SimilarIssue[];
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function MergeIssuesDialog({
  issueId,
  issueTitle,
  similarIssues,
  isOpen,
  onClose,
  onSuccess,
}: MergeIssuesDialogProps) {
  const [selectedIssues, setSelectedIssues] = useState<string[]>([]);

  const mergeIssues = useMergeIssues(issueId);

  const toggleIssue = (issueIdToToggle: string) => {
    setSelectedIssues((prev) =>
      prev.includes(issueIdToToggle)
        ? prev.filter((id) => id !== issueIdToToggle)
        : [...prev, issueIdToToggle]
    );
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedIssues.length === 0) return;

    try {
      await mergeIssues.mutateAsync({
        duplicateIssueIds: selectedIssues,
      });
      setSelectedIssues([]);
      onSuccess?.();
      onClose();
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleClose = () => {
    setSelectedIssues([]);
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
              Merge Issues
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
          <div className="rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              <strong>Note:</strong> This will merge the selected issues into "{issueTitle}". 
              The selected issues will be marked as merged and closed.
            </p>
          </div>

          {/* Similar Issues Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Select Issues to Merge <span className="text-error-600">*</span>
            </label>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Select one or more issues to merge into this issue
            </p>
            
            {similarIssues.length > 0 ? (
              <div className="max-h-60 space-y-2 overflow-y-auto">
                {similarIssues.map((similar) => (
                  <div
                    key={similar.issueId}
                    onClick={() => toggleIssue(similar.issueId)}
                    className={cn(
                      'cursor-pointer rounded-lg border p-3 transition-colors',
                      selectedIssues.includes(similar.issueId)
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-neutral-200 hover:border-neutral-300 dark:border-neutral-700 dark:hover:border-neutral-600'
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          'mt-0.5 flex h-5 w-5 items-center justify-center rounded border',
                          selectedIssues.includes(similar.issueId)
                            ? 'border-primary-500 bg-primary-500'
                            : 'border-neutral-300 dark:border-neutral-600'
                        )}>
                          {selectedIssues.includes(similar.issueId) && (
                            <Check className="h-3 w-3 text-white" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-neutral-900 dark:text-neutral-100">
                            {similar.title}
                          </p>
                          <p className="text-sm text-neutral-500 dark:text-neutral-400">
                            {similar.category} • Similarity: {Math.round(similar.similarityScore * 100)}%
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-neutral-500 p-3">
                No similar issues found to merge
              </p>
            )}
          </div>

          {/* Selected Count */}
          {selectedIssues.length > 0 && (
            <div className="rounded-lg bg-neutral-100 p-3 dark:bg-neutral-800">
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                <strong>{selectedIssues.length}</strong> issue(s) will be merged into this issue
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={mergeIssues.isPending}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="btn-primary flex-1"
              disabled={mergeIssues.isPending || selectedIssues.length === 0}
            >
              {mergeIssues.isPending ? (
                <>
                  <span className="spinner mr-2 h-4 w-4" />
                  Merging...
                </>
              ) : (
                <>
                  <GitMerge className="mr-2 h-4 w-4" />
                  Merge {selectedIssues.length > 0 ? `(${selectedIssues.length})` : ''}
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
