'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, Package } from 'lucide-react';
import { useLostFoundItems } from '@/hooks/queries/use-lost-found';
import { AppShell } from '@/components/layout';
import { LostFoundCard } from '@/components/lost-found/lost-found-card';
import { LostFoundFilter } from '@/components/lost-found/lost-found-filter';
import { Button } from '@/components/ui/button';

export default function LostFoundPage() {
  const [filters, setFilters] = useState<{
    status?: string;
    category?: string;
    search?: string;
  }>({});

  const { data, isLoading } = useLostFoundItems({
    page: 1,
    limit: 50,
    ...filters,
  });

  const items = data?.data || [];
  const hasFilters = Object.values(filters).some(v => v !== undefined && v !== '');

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-50">
              Lost & Found
            </h1>
            <p className="mt-1 text-neutral-600 dark:text-neutral-400">
              {data?.pagination?.total || 0} items
            </p>
          </div>
          <Link href="/lost-found/new">
            <Button className="btn-primary">
              <Plus className="mr-2 h-4 w-4" />
              Report Item
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <LostFoundFilter onFilterChange={setFilters} />

        {/* Loading Skeleton */}
        {isLoading && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="skeleton h-80 rounded-xl" />
            ))}
          </div>
        )}

        {/* Items Grid */}
        {!isLoading && items.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <LostFoundCard key={item.id} item={item} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && items.length === 0 && (
          <div className="flex min-h-[400px] flex-col items-center justify-center text-center">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800">
              <Package className="h-10 w-10 text-neutral-400 dark:text-neutral-500" />
            </div>

            <h3 className="mb-2 text-xl font-semibold text-neutral-900 dark:text-neutral-50">
              {hasFilters ? 'No Items Found' : 'No Items Reported'}
            </h3>

            <p className="mb-6 max-w-md text-sm text-neutral-600 dark:text-neutral-400">
              {hasFilters
                ? 'Try adjusting your filters to find what you\'re looking for.'
                : 'Report a lost or found item to help others.'}
            </p>

            {!hasFilters && (
              <Link href="/lost-found/new">
                <Button className="btn-primary">
                  <Plus className="mr-2 h-4 w-4" />
                  Report First Item
                </Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}