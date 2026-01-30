'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useNotifications } from '@/hooks/queries/use-notifications';
import {
  useMarkNotificationRead,
  useMarkAllNotificationsRead
} from '@/hooks/mutations/use-notification-mutations';
import { ProtectedRoute } from '@/components/auth/protected-route';

function NotificationsPageContent() {
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    unreadOnly: false,
    type: '',
  });

  const { data, isLoading } = useNotifications(filters);
  const markAllRead = useMarkAllNotificationsRead();

  const handleMarkAllRead = async () => {
    try {
      await markAllRead.mutateAsync();
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-neutral-900">Notifications</h1>
            <button
              onClick={handleMarkAllRead}
              disabled={markAllRead.isPending}
              className="px-4 py-2 text-sm bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
            >
              Mark All Read
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.unreadOnly}
                onChange={(e) => setFilters(prev => ({ ...prev, unreadOnly: e.target.checked, page: 1 }))}
                className="w-4 h-4 text-primary-600 border-neutral-300 rounded"
              />
              <span className="text-sm text-neutral-700">Unread only</span>
            </label>
          </div>
        </div>

        {/* Notifications List */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow p-4 animate-pulse">
                <div className="h-4 bg-neutral-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-neutral-200 rounded w-full"></div>
              </div>
            ))}
          </div>
        ) : data?.data.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-neutral-500">No notifications</p>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {data?.data.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                />
              ))}
            </div>

            {/* Pagination */}
            {data && data.pagination.totalPages > 1 && (
              <div className="mt-6 flex justify-center gap-2">
                <button
                  onClick={() => handlePageChange(filters.page - 1)}
                  disabled={filters.page === 1}
                  className="px-4 py-2 border border-neutral-300 rounded-md hover:bg-neutral-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="px-4 py-2">
                  Page {filters.page} of {data.pagination.totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(filters.page + 1)}
                  disabled={!data.pagination.hasMore}
                  className="px-4 py-2 border border-neutral-300 rounded-md hover:bg-neutral-50 disabled:opacity-50"
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

function NotificationItem({ notification }: { notification: any }) {
  const markRead = useMarkNotificationRead(notification.id);

  const handleClick = () => {
    if (!notification.isRead) {
      markRead.mutate();
    }
  };

  return (
    <>
      {notification.link ? (
        <Link
          href={notification.link}
          onClick={handleClick}
          className={`block bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow
                ${!notification.isRead ? 'border-l-4 border-primary-600' : ''}
                cursor-pointer
              `}
        >
          <div className="flex items-start gap-3">
            {!notification.isRead && (
              <span className="w-2 h-2 bg-primary-600 rounded-full mt-2"></span>
            )}
            <div className="flex-1">
              <h3 className={`text-sm font-medium ${!notification.isRead ? 'text-neutral-900' : 'text-neutral-600'}`}>
                {notification.title}
              </h3>
              <p className="text-sm text-neutral-600 mt-1">
                {notification.message}
              </p>
              <p className="text-xs text-neutral-500 mt-2">
                {new Date(notification.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
        </Link>
      ) : (
        <div
          onClick={handleClick}
          className={`block bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow
                ${!notification.isRead ? 'border-l-4 border-primary-600' : ''}
              `}
        >
          <div className="flex items-start gap-3">
            {!notification.isRead && (
              <span className="w-2 h-2 bg-primary-600 rounded-full mt-2"></span>
            )}
            <div className="flex-1">
              <h3 className={`text-sm font-medium ${!notification.isRead ? 'text-neutral-900' : 'text-neutral-600'}`}>
                {notification.title}
              </h3>
              <p className="text-sm text-neutral-600 mt-1">
                {notification.message}
              </p>
              <p className="text-xs text-neutral-500 mt-2">
                {new Date(notification.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function NotificationsPage() {
  return (
    <ProtectedRoute>
      <NotificationsPageContent />
    </ProtectedRoute>
  );
}