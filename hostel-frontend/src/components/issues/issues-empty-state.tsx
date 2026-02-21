'use client';

import Link from 'next/link';
import { FileQuestion, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface IssuesEmptyStateProps {
  hasFilters: boolean;
}

export function IssuesEmptyState({ hasFilters }: IssuesEmptyStateProps) {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800">
        <FileQuestion className="h-10 w-10 text-neutral-400 dark:text-neutral-500" />
      </div>

      <h3 className="mb-2 text-xl font-semibold text-neutral-900 dark:text-neutral-50">
        {hasFilters ? 'No Issues Found' : 'No Issues Reported Yet'}
      </h3>

      <p className="mb-6 max-w-md text-sm text-neutral-600 dark:text-neutral-400">
        {hasFilters
          ? "Try adjusting your filters to find what you're looking for."
          : "Be the first to report an issue and help improve our hostel."}
      </p>

      {!hasFilters && (
        <Link href="/issues/new">
          <Button className="btn-primary">
            <Plus className="mr-2 h-4 w-4" />
            Report First Issue
          </Button>
        </Link>
      )}
    </div>
  );
}