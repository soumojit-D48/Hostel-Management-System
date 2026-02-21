'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { useIssues } from '@/hooks/queries/use-issues';
import { AppShell } from '@/components/layout/app-shell';
import { IssueCard } from '@/components/issues/issue-card';
import { IssuesFilterBar } from '@/components/issues/issues-filter-bar';
import { IssuesEmptyState } from '@/components/issues/issues-empty-state';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function IssuesPage() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<{
    status?: string;
    category?: string;
    priority?: string;
    search?: string;
  }>({});

  const { data, isLoading } = useIssues({
    page,
    limit: 12,
    ...filters,
  });

  const issues = data?.data || [];
  const totalPages = data?.pagination?.totalPages || 1;
  const hasFilters = Object.values(filters).some(v => v !== undefined && v !== '');

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-50">
              Issues
            </h1>
            <p className="mt-1 text-neutral-600 dark:text-neutral-400">
              {data?.pagination?.total || 0} total issues
            </p>
          </div>
          <Link href="/issues/new">
            <Button className="btn-primary">
              <Plus className="mr-2 h-4 w-4" />
              New Issue
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <IssuesFilterBar onFilterChange={setFilters} />

        {/* Loading Skeleton */}
        {isLoading && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="skeleton h-64 rounded-xl" />
            ))}
          </div>
        )}

        {/* Issues Grid */}
        {!isLoading && issues.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {issues.map((issue) => (
              <IssueCard key={issue.id} issue={issue} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && issues.length === 0 && (
          <IssuesEmptyState hasFilters={hasFilters} />
        )}

        {/* Pagination */}
        {!isLoading && issues.length > 0 && totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>

            <div className="flex items-center gap-1">
              {[...Array(Math.min(5, totalPages))].map((_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (page <= 3) {
                  pageNum = i + 1;
                } else if (page >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = page - 2 + i;
                }

                return (
                  <button
                    key={i}
                    onClick={() => setPage(pageNum)}
                    className={cn(
                      'flex h-8 w-8 items-center justify-center rounded-md text-sm transition-colors',
                      page === pageNum
                        ? 'bg-primary-600 text-white'
                        : 'text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800'
                    )}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </AppShell>
  );
}