'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useIssue, useSimilarIssues } from '@/hooks/queries/use-issues';
import { AppShell } from '@/components/layout/app-shell';
import { IssueHeader } from '@/components/issues/issue-header';
import { IssueImagesGallery } from '@/components/issues/issue-images-gallery';
import { AssignmentInfoCard } from '@/components/issues/assignment-info-card';
import { CommentsSection } from '@/components/issues/comments-section';
import { ReactionsBar } from '@/components/issues/reactions-bar';
import { IssueCard } from '@/components/issues/issue-card';
import { Button } from '@/components/ui/button';

export default function IssueDetailPage() {
  const params = useParams();
  const router = useRouter();
  const issueId = params.id as string;

  const { data: issue, isLoading } = useIssue(issueId);
  const { data: similarIssues } = useSimilarIssues(issueId);

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
              onAssign={() => {/* TODO: Open assign modal */}}
              onUpdateStatus={() => {/* TODO: Open status modal */}}
              onDelete={() => {/* TODO: Implement delete */}}
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
            {similarIssues && similarIssues.length > 0 && (
              <div>
                <h3 className="mb-4 text-lg font-semibold text-neutral-900 dark:text-neutral-50">
                  Similar Issues
                </h3>
                <div className="space-y-3">
                  {similarIssues.slice(0, 3).map((similarIssue) => (
                    <IssueCard key={similarIssue.id} issue={similarIssue} />
                  ))}
                </div>
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
                        by {merged.reportedBy.name}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}