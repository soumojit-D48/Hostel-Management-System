'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useIssue, useSimilarIssues } from '@/hooks/queries/use-issues';
import { useAuth } from '@/hooks/use-auth';
import { AppShell } from '@/components/layout/app-shell';
import { IssueHeader } from '@/components/issues/issue-header';
import { IssueImagesGallery } from '@/components/issues/issue-images-gallery';
import { AssignmentInfoCard } from '@/components/issues/assignment-info-card';
import { CommentsSection } from '@/components/issues/comments-section';
import { ReactionsBar } from '@/components/issues/reactions-bar';
import { IssueCard } from '@/components/issues/issue-card';
import { Button } from '@/components/ui/button';
import { AssignIssueDialog } from '@/components/issues/assign-issue-dialog';
import { UpdateStatusDialog } from '@/components/issues/update-status-dialog';
import { MergeIssuesDialog } from '@/components/issues/merge-issues-dialog';
import { useDeleteIssue } from '@/hooks/mutations/use-issue-edit-delete';

export default function IssueDetailPage() {
  const params = useParams();
  const router = useRouter();
  const issueId = params.id as string;
  const { user } = useAuth();

  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [showMergeDialog, setShowMergeDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const { data: issue, isLoading } = useIssue(issueId);
  const { data: similarIssues } = useSimilarIssues(issueId);
  const deleteIssue = useDeleteIssue();

  const isAssignedToCurrentUser = issue?.assignedTo?.id === user?.id;

  const handleDelete = async () => {
    try {
      await deleteIssue.mutateAsync(issueId);
      router.push('/issues');
    } catch (error) {
      // Error handled by mutation
    }
  };

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

  if (!issue) {
    return (
      <AppShell>
        <div className="flex min-h-[400px] flex-col items-center justify-center text-center">
          <h2 className="mb-4 text-2xl font-bold text-neutral-900 dark:text-neutral-50">
            Issue Not Found
          </h2>
          <p className="mb-6 text-neutral-600 dark:text-neutral-400">
            The issue you're looking for doesn't exist or has been removed.
          </p>
          <Link href="/issues">
            <Button className="btn-primary">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Issues
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
        <Link href="/issues">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Issues
          </Button>
        </Link>

        {/* Two Column Layout */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content - Left Column (2/3) */}
          <div className="space-y-6 lg:col-span-2">
            {/* Header */}
            <IssueHeader
              issue={issue}
              onEdit={() => router.push(`/issues/${issueId}/edit`)}
              onAssign={() => setShowAssignDialog(true)}
              onUpdateStatus={() => setShowStatusDialog(true)}
              onDelete={() => setShowDeleteDialog(true)}
            />

            {/* Images */}
            {issue.images && issue.images.length > 0 && (
              <div>
                <h3 className="mb-4 text-lg font-semibold text-neutral-900 dark:text-neutral-50">
                  Images
                </h3>
                <IssueImagesGallery images={issue.images} />
              </div>
            )}

            {/* Description */}
            <div className="card">
              <h3 className="mb-4 text-lg font-semibold text-neutral-900 dark:text-neutral-50">
                Description
              </h3>
              <p className="whitespace-pre-wrap text-neutral-700 dark:text-neutral-300">
                {issue.description}
              </p>
              {issue.location && (
                <div className="mt-4 rounded-lg bg-neutral-50 p-3 dark:bg-neutral-800">
                  <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                    Location
                  </p>
                  <p className="text-neutral-900 dark:text-neutral-50">
                    {issue.location}
                  </p>
                </div>
              )}
            </div>

            {/* Reactions */}
            <div>
              <h3 className="mb-4 text-lg font-semibold text-neutral-900 dark:text-neutral-50">
                Reactions
              </h3>
              <ReactionsBar issueId={issueId} />
            </div>

            {/* Comments */}
            <CommentsSection issueId={issueId} />
          </div>

          {/* Sidebar - Right Column (1/3) */}
          <div className="space-y-6">
            {/* Assignment Info */}
            <AssignmentInfoCard issue={issue} />

            {/* Similar Issues */}
            {similarIssues && (
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">
                    Similar Issues
                  </h3>
                  {user?.role === 'MANAGEMENT' && similarIssues.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowMergeDialog(true)}
                    >
                      Merge
                    </Button>
                  )}
                </div>
                {similarIssues.length > 0 ? (
                  <div className="space-y-3">
                    {similarIssues.slice(0, 3).map((similarIssue) => (
                      <IssueCard 
                        key={similarIssue.issueId} 
                        issue={{
                          id: similarIssue.issueId,
                          title: similarIssue.title,
                          category: similarIssue.category,
                          status: 'REPORTED',
                          description: '',
                          reportedBy: { name: 'Unknown' }
                        } as any} 
                      />
                    ))}
                  </div>
                ) : (
                  <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4 text-center dark:border-neutral-700 dark:bg-neutral-800">
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                      No similar issues found
                    </p>
                    <p className="mt-1 text-xs text-neutral-400 dark:text-neutral-500">
                      Issues with similar titles will appear here
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Merged Issues Info */}
            {issue.isMerged && issue.mergedIntoId && (
              <div className="card border-l-4 border-warning-600 dark:border-warning-400">
                <h3 className="mb-2 font-semibold text-warning-700 dark:text-warning-300">
                  Merged Issue
                </h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  This issue has been merged into:{' '}
                  <Link
                    href={`/issues/${issue.mergedIntoId}`}
                    className="font-medium text-primary-600 hover:underline dark:text-primary-400"
                  >
                    {issue.mergedIntoTitle}
                  </Link>
                </p>
              </div>
            )}

            {issue.mergedIssues && issue.mergedIssues.length > 0 && (
              <div className="card">
                <h3 className="mb-3 font-semibold text-neutral-900 dark:text-neutral-50">
                  Merged Issues ({issue.mergedIssues.length})
                </h3>
                <div className="space-y-2">
                  {issue.mergedIssues.map((merged) => (
                    <div
                      key={merged.id}
                      className="rounded-lg bg-neutral-50 p-3 dark:bg-neutral-800"
                    >
                      <Link
                        href={`/issues/${merged.id}`}
                        className="text-sm font-medium text-primary-600 hover:underline dark:text-primary-400"
                      >
                        {merged.title}
                      </Link>
                      <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-400">
                        by {merged.reportedBy?.name || 'Unknown'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Assign Dialog */}
      <AssignIssueDialog
        issueId={issueId}
        issueTitle={issue?.title || ''}
        isOpen={showAssignDialog}
        onClose={() => setShowAssignDialog(false)}
      />

      {/* Status Update Dialog */}
      <UpdateStatusDialog
        issueId={issueId}
        issueTitle={issue?.title || ''}
        currentStatus={issue?.status as any}
        isAssignedToCurrentUser={isAssignedToCurrentUser}
        isOpen={showStatusDialog}
        onClose={() => setShowStatusDialog(false)}
      />

      {/* Merge Dialog */}
      <MergeIssuesDialog
        issueId={issueId}
        issueTitle={issue?.title || ''}
        similarIssues={similarIssues || []}
        isOpen={showMergeDialog}
        onClose={() => setShowMergeDialog(false)}
      />

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <div className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowDeleteDialog(false)} />
          <div className="modal-content relative z-10 w-full max-w-md">
            <div className="rounded-lg bg-white p-6 shadow-xl dark:bg-neutral-900">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                Delete Issue
              </h3>
              <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
                Are you sure you want to delete this issue? This action cannot be undone.
              </p>
              <div className="mt-4 flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteDialog(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={deleteIssue.isPending}
                  className="flex-1"
                >
                  {deleteIssue.isPending ? 'Deleting...' : 'Delete'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}