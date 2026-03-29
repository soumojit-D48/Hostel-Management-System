'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Bell, 
  CheckCheck, 
  AlertCircle, 
  Megaphone, 
  Package, 
  MessageSquare,
  Info,
  Calendar,
  Clock
} from 'lucide-react';
import { useNotifications, useUnreadNotificationsCount } from '@/hooks/queries/use-notifications';
import {
  useMarkNotificationRead,
  useMarkAllNotificationsRead
} from '@/hooks/mutations/use-notification-mutations';
import { AppShell } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { cn, formatRelativeTime } from '@/lib/utils';

function NotificationsPageContent() {
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    unreadOnly: false,
    type: '',
  });

  const { data, isLoading } = useNotifications(filters);
  const { data: unreadCount } = useUnreadNotificationsCount();
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
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 shadow-lg shadow-primary-500/20">
              <Bell className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
                Notifications
              </h1>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                You have {unreadCount?.count || 0} unread notification{unreadCount?.count !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleMarkAllRead}
              disabled={markAllRead.isPending || !unreadCount?.count}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <CheckCheck className="h-4 w-4" />
              Mark All Read
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="card bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-950 dark:to-primary-900/50 border-primary-200 dark:border-primary-800">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-500/20">
                <Bell className="h-5 w-5 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-primary-700 dark:text-primary-300">
                  {unreadCount?.count || 0}
                </p>
                <p className="text-xs text-primary-600 dark:text-primary-400">Unread</p>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-warning-100 dark:bg-warning-900/30">
                <AlertCircle className="h-5 w-5 text-warning-600 dark:text-warning-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
                  {data?.data.filter(n => String(n.type).includes('issue')).length || 0}
                </p>
                <p className="text-xs text-neutral-500">Issues</p>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                <Megaphone className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
                  {data?.data.filter(n => String(n.type).includes('announcement')).length || 0}
                </p>
                <p className="text-xs text-neutral-500">Announcements</p>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success-100 dark:bg-success-900/30">
                <Package className="h-5 w-5 text-success-600 dark:text-success-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
                  {data?.data.filter(n => String(n.type).includes('lost') || String(n.type).includes('found') || String(n.type).includes('claim')).length || 0}
                </p>
                <p className="text-xs text-neutral-500">Lost & Found</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="card">
          <div className="flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.unreadOnly}
                onChange={(e) => setFilters(prev => ({ ...prev, unreadOnly: e.target.checked, page: 1 }))}
                className="w-4 h-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
              />
              <span className="text-sm text-neutral-700 dark:text-neutral-300">Unread only</span>
            </label>
            <div className="h-4 w-px bg-neutral-200 dark:bg-neutral-700 hidden sm:block"></div>
            <div className="flex items-center gap-2 text-sm text-neutral-500">
              <Clock className="h-4 w-4" />
              <span>Showing {data?.data.length || 0} of {data?.pagination.total || 0} notifications</span>
            </div>
          </div>
        </div>

        {/* Notifications List */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="card animate-pulse">
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-full bg-neutral-200 dark:bg-neutral-700"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-3/4"></div>
                    <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded w-full"></div>
                    <div className="h-2 bg-neutral-200 dark:bg-neutral-700 rounded w-1/4"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : data?.data.length === 0 ? (
          <div className="card text-center py-16">
            <div className="flex justify-center mb-4">
              <div className="h-20 w-20 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                <Bell className="h-10 w-10 text-neutral-400" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50 mb-2">
              No notifications yet
            </h3>
            <p className="text-neutral-500 dark:text-neutral-400 max-w-sm mx-auto">
              You'll see notifications here when something new happens - like new announcements, issue updates, or lost & found updates.
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              {data?.data.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                />
              ))}
            </div>

            {/* Pagination */}
            {data && data.pagination.totalPages > 1 && (
              <div className="flex items-center justify-between">
                <p className="text-sm text-neutral-500">
                  Page {filters.page} of {data.pagination.totalPages}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(filters.page - 1)}
                    disabled={filters.page === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(filters.page + 1)}
                    disabled={!data.pagination.hasMore}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </AppShell>
  );
}

function NotificationItem({ notification }: { notification: any }) {
  const markRead = useMarkNotificationRead(notification.id);

  const handleClick = () => {
    if (!notification.isRead) {
      markRead.mutate();
    }
  };

  const getIcon = () => {
    const type = notification.type?.toLowerCase() || '';
    if (type.includes('issue')) return <AlertCircle className="h-5 w-5 text-warning-600 dark:text-warning-400" />;
    if (type.includes('announcement')) return <Megaphone className="h-5 w-5 text-blue-600 dark:text-blue-400" />;
    if (type.includes('lost') || type.includes('found') || type.includes('claim')) return <Package className="h-5 w-5 text-success-600 dark:text-success-400" />;
    if (type.includes('comment')) return <MessageSquare className="h-5 w-5 text-purple-600 dark:text-purple-400" />;
    return <Info className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />;
  };

  const getIconBg = () => {
    const type = notification.type?.toLowerCase() || '';
    if (type.includes('issue')) return 'bg-warning-100 dark:bg-warning-900/30';
    if (type.includes('announcement')) return 'bg-blue-100 dark:bg-blue-900/30';
    if (type.includes('lost') || type.includes('found') || type.includes('claim')) return 'bg-success-100 dark:bg-success-900/30';
    if (type.includes('comment')) return 'bg-purple-100 dark:bg-purple-900/30';
    return 'bg-neutral-100 dark:bg-neutral-800';
  };

  const content = (
    <div className={cn(
      "group relative flex items-start gap-4 p-4 rounded-xl transition-all duration-200",
      "hover:bg-neutral-50 dark:hover:bg-neutral-800/50",
      !notification.isRead && "bg-primary-50/50 dark:bg-primary-950/20"
    )}>
      {/* Unread Indicator */}
      {!notification.isRead && (
        <span className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-primary-500 rounded-full"></span>
      )}
      
      {/* Icon */}
      <div className={cn(
        "flex h-11 w-11 items-center justify-center rounded-xl flex-shrink-0 transition-transform group-hover:scale-110",
        getIconBg()
      )}>
        {getIcon()}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h3 className={cn(
            "font-semibold truncate",
            !notification.isRead 
              ? "text-neutral-900 dark:text-neutral-100" 
              : "text-neutral-700 dark:text-neutral-300"
          )}>
            {notification.title}
          </h3>
          {!notification.isRead && (
            <span className="flex-shrink-0 px-2 py-0.5 text-xs font-medium bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300 rounded-full">
              New
            </span>
          )}
        </div>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1 line-clamp-2">
          {notification.message}
        </p>
        <div className="flex items-center gap-1 mt-2 text-xs text-neutral-500">
          <Calendar className="h-3 w-3" />
          <span>{formatRelativeTime(notification.createdAt)}</span>
        </div>
      </div>

      {/* Arrow Icon */}
      <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <svg className="h-5 w-5 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </div>
  );

  if (notification.link) {
    return (
      <Link
        href={notification.link}
        onClick={handleClick}
        className="block rounded-xl hover:shadow-md transition-shadow"
      >
        {content}
      </Link>
    );
  }

  return (
    <div
      onClick={handleClick}
      className="cursor-pointer rounded-xl hover:shadow-md transition-shadow"
    >
      {content}
    </div>
  );
}

export default function NotificationsPage() {
  return <NotificationsPageContent />;
}
