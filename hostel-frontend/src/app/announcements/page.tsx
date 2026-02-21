'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, Megaphone } from 'lucide-react';
import { useAnnouncements } from '@/hooks/queries/use-announcements';
import { useAuth } from '@/hooks/use-auth';
import { AppShell } from '@/components/layout';
import { AnnouncementCard } from '@/components/announcements/announcement-card';
import { AnnouncementsFilter } from '@/components/announcements/announcements-filter';
import { Button } from '@/components/ui/button';

export default function AnnouncementsPage() {
  const { isManagement } = useAuth();
  const [filters, setFilters] = useState<{
    category?: string;
    priority?: string;
    unreadOnly?: boolean;
    search?: string;
  }>({});

  const { data, isLoading } = useAnnouncements({
    page: 1,
    limit: 50,
    ...filters,
  });

  const announcements = data?.data || [];
  const hasFilters = Object.values(filters).some(v => v !== undefined && v !== '' && v !== false);

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-50">
              Announcements
            </h1>
            <p className="mt-1 text-neutral-600 dark:text-neutral-400">
              {data?.pagination?.total || 0} total announcements
            </p>
          </div>
          {isManagement && (
            <Link href="/announcements/new">
              <Button className="btn-primary">
                <Plus className="mr-2 h-4 w-4" />
                New Announcement
              </Button>
            </Link>
          )}
        </div>

        {/* Filters */}
        <AnnouncementsFilter onFilterChange={setFilters} />

        {/* Loading Skeleton */}
        {isLoading && (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="skeleton h-48 rounded-xl" />
            ))}
          </div>
        )}

        {/* Announcements List (Stacked) */}
        {!isLoading && announcements.length > 0 && (
          <div className="space-y-4">
            {announcements.map((announcement) => (
              <AnnouncementCard key={announcement.id} announcement={announcement} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && announcements.length === 0 && (
          <div className="flex min-h-[400px] flex-col items-center justify-center text-center">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800">
              <Megaphone className="h-10 w-10 text-neutral-400 dark:text-neutral-500" />
            </div>

            <h3 className="mb-2 text-xl font-semibold text-neutral-900 dark:text-neutral-50">
              {hasFilters ? 'No Announcements Found' : 'No Announcements Yet'}
            </h3>

            <p className="mb-6 max-w-md text-sm text-neutral-600 dark:text-neutral-400">
              {hasFilters
                ? 'Try adjusting your filters to find what you\'re looking for.'
                : 'No announcements have been posted yet. Check back later!'}
            </p>

            {!hasFilters && isManagement && (
              <Link href="/announcements/new">
                <Button className="btn-primary">
                  <Plus className="mr-2 h-4 w-4" />
                  Create First Announcement
                </Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}