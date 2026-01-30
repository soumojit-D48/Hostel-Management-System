'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAnnouncements, useUnreadAnnouncementsCount } from '@/hooks/queries/use-announcements';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { useAuth } from '@/hooks/use-auth';
import { AnnouncementCategory } from '@/types/announcement.types';

function AnnouncementsListContent() {
  const { isManagement } = useAuth();
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    category: '',
    unreadOnly: false,
  });

  const { data, isLoading, error } = useAnnouncements(filters);
  const { data: unreadCount } = useUnreadAnnouncementsCount();

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  if (error) {
    return (
      <div className="min-h-screen bg-neutral-50 p-8">
        <div className="max-w-5xl mx-auto">
          <div className="bg-error-50 border border-error-200 text-error-700 px-4 py-3 rounded">
            Error loading announcements: {(error as any).message}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-neutral-900">Announcements</h1>
              <p className="text-sm text-neutral-600 mt-1">
                {unreadCount?.count || 0} unread announcements
              </p>
            </div>
            {isManagement && (
              <Link
                href="/announcements/new"
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
              >
                Create Announcement
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-[200px]">
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">All Categories</option>
                <option value="GENERAL">General</option>
                <option value="MAINTENANCE">Maintenance</option>
                <option value="EVENTS">Events</option>
                <option value="RULES">Rules</option>
                <option value="EMERGENCY">Emergency</option>
              </select>
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.unreadOnly}
                onChange={(e) => handleFilterChange('unreadOnly', e.target.checked)}
                className="w-4 h-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
              />
              <span className="text-sm text-neutral-700">Unread only</span>
            </label>
          </div>
        </div>

        {/* Announcements List */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
                <div className="h-4 bg-neutral-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-neutral-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-neutral-200 rounded w-5/6"></div>
              </div>
            ))}
          </div>
        ) : data?.data.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-neutral-500 text-lg">No announcements found</p>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {data?.data.map((announcement) => (
                <Link
                  key={announcement.id}
                  href={`/announcements/${announcement.id}`}
                  className={`
                    block bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6
                    ${!announcement.isRead ? 'border-l-4 border-primary-600' : ''}
                  `}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {!announcement.isRead && (
                        <span className="w-2 h-2 bg-primary-600 rounded-full"></span>
                      )}
                      <span className={`px-2 py-1 text-xs font-medium rounded ${
                        announcement.category === 'EMERGENCY' 
                          ? 'bg-error-100 text-error-700' 
                          : announcement.category === 'MAINTENANCE'
                          ? 'bg-warning-100 text-warning-700'
                          : 'bg-info-100 text-info-700'
                      }`}>
                        {announcement.category}
                      </span>
                      {announcement.priority === 'HIGH' && (
                        <span className="px-2 py-1 text-xs font-medium rounded bg-error-100 text-error-700">
                          High Priority
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-neutral-500">
                      {new Date(announcement.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                    {announcement.title}
                  </h3>
                  <p className="text-sm text-neutral-600 line-clamp-2">
                    {announcement.content}
                  </p>

                  <div className="mt-4 flex items-center gap-4 text-xs text-neutral-500">
                    <span>By {announcement.createdBy.name}</span>
                    {announcement.images && announcement.images.length > 0 && (
                      <span>📷 {announcement.images.length} images</span>
                    )}
                    {announcement.attachments && announcement.attachments.length > 0 && (
                      <span>📎 {announcement.attachments.length} attachments</span>
                    )}
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {data && data.pagination.totalPages > 1 && (
              <div className="mt-8 flex justify-center gap-2">
                <button
                  onClick={() => handlePageChange(filters.page - 1)}
                  disabled={filters.page === 1}
                  className="px-4 py-2 border border-neutral-300 rounded-md hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="px-4 py-2">
                  Page {filters.page} of {data.pagination.totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(filters.page + 1)}
                  disabled={!data.pagination.hasMore}
                  className="px-4 py-2 border border-neutral-300 rounded-md hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function AnnouncementsListPage() {
  return (
    <ProtectedRoute>
      <AnnouncementsListContent />
    </ProtectedRoute>
  );
}