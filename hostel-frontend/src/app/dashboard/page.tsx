'use client';

import Link from 'next/link';
import { 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  TrendingUp,
  Plus,
  List,
  Package,
  Bell,
  Megaphone,
  Eye,
  ThumbsUp,
  Users,
  ArrowRight,
  Activity,
  Target,
  Zap
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useDashboardAnalytics } from '@/hooks/queries/use-analytics';
import { useUnreadNotificationsCount } from '@/hooks/queries/use-notifications';
import { AppShell } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { cn, formatRelativeTime } from '@/lib/utils';

export default function DashboardPage() {
  const { user } = useAuth();
  const { data: analytics, isLoading } = useDashboardAnalytics();
  const { data: unreadCount } = useUnreadNotificationsCount();

  const isStudent = user?.role === 'STUDENT';
  const isStaff = user?.role === 'STAFF';
  const isManagement = user?.role === 'MANAGEMENT';

  const totalIssues = analytics?.totalIssues || 0;
  const resolvedIssues = (analytics?.statusCounts?.RESOLVED || 0) + (analytics?.statusCounts?.CLOSED || 0);
  const pendingIssues = (analytics?.statusCounts?.REPORTED || 0) + (analytics?.statusCounts?.ASSIGNED || 0) + (analytics?.statusCounts?.IN_PROGRESS || 0);
  const inProgressIssues = analytics?.statusCounts?.IN_PROGRESS || 0;

  if (isLoading) {
    return (
      <AppShell>
        <div className="space-y-6 animate-pulse">
          <div className="h-32 bg-neutral-200 dark:bg-neutral-800 rounded-2xl"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-28 bg-neutral-200 dark:bg-neutral-800 rounded-xl"></div>
            ))}
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 shadow-lg shadow-primary-500/20">
              <span className="text-2xl text-white font-bold">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-neutral-900 dark:text-neutral-50">
                Welcome back, {user?.name?.split(' ')[0]}! 👋
              </h1>
              <p className="text-neutral-600 dark:text-neutral-400">
                {isStudent && "Track your reported issues and stay updated"}
                {isStaff && "Manage and resolve issues assigned to you"}
                {isManagement && "Overview of all hostel activities"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/notifications" className="relative">
              <div className="p-3 rounded-xl bg-white dark:bg-neutral-800 shadow-md hover:shadow-lg transition-shadow">
                {/* <Bell className="h-5 w-5 text-neutral-700 dark:text-neutral-300" /> */}
                {unreadCount && unreadCount.count > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 bg-error-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {unreadCount.count > 9 ? '9+' : unreadCount.count}
                  </span>
                )}
              </div>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title={isStudent ? "My Issues" : "Total Issues"}
            value={totalIssues}
            icon={AlertCircle}
            color="primary"
            subtitle="All time"
          />
          <StatCard
            title="Resolved"
            value={resolvedIssues}
            icon={CheckCircle}
            color="success"
            subtitle="Completed"
          />
          <StatCard
            title={isStaff ? "Assigned" : "Pending"}
            value={isStaff ? (analytics?.statusCounts?.ASSIGNED || 0) + (analytics?.statusCounts?.IN_PROGRESS || 0) : pendingIssues}
            icon={Clock}
            color="warning"
            subtitle={isStaff ? "To work on" : "In progress"}
          />
          <StatCard
            title="Avg Resolution"
            value={`${Math.round(analytics?.avgResolutionTimeHours || 0)}h`}
            icon={TrendingUp}
            color="info"
            subtitle="Average time"
          />
        </div>

        {/* Secondary Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="card bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-950 dark:to-primary-900/30 border-primary-200 dark:border-primary-800">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-500/20">
                <Zap className="h-5 w-5 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-primary-700 dark:text-primary-300">New Today</p>
              </div>
            </div>
            <p className="text-3xl font-bold text-primary-700 dark:text-primary-300">
              {analytics?.newIssuesToday || 0}
            </p>
          </div>
          <div className="card bg-gradient-to-br from-success-50 to-success-100 dark:from-success-950 dark:to-success-900/30 border-success-200 dark:border-success-800">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success-500/20">
                <Target className="h-5 w-5 text-success-600 dark:text-success-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-success-700 dark:text-success-300">Resolution Rate</p>
              </div>
            </div>
            <p className="text-3xl font-bold text-success-700 dark:text-success-300">
              {Math.round(analytics?.resolutionRate || 0)}%
            </p>
          </div>
          <div className="card bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900/30 border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/20">
                <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Response Time</p>
              </div>
            </div>
            <p className="text-3xl font-bold text-blue-700 dark:text-blue-300">
              {Math.round(analytics?.avgResponseTimeHours || 0)}h
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-50">Quick Actions</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <QuickActionCard
              href="/issues/new"
              icon={Plus}
              title="Report Issue"
              description="Create new issue"
              color="primary"
            />
            <QuickActionCard
              href="/issues"
              icon={List}
              title="View Issues"
              description="Browse all issues"
              color="neutral"
            />
            <QuickActionCard
              href="/lost-found/new"
              icon={Package}
              title="Lost & Found"
              description="Report item"
              color="warning"
            />
            <QuickActionCard
              href="/announcements"
              icon={Megaphone}
              title="Announcements"
              description="View updates"
              color="info"
            />
          </div>
        </div>

        {/* Status Breakdown */}
        {analytics?.statusCounts && (
          <div className="card">
            <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-50 mb-4">
              Issue Status Overview
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <StatusItem
                status="Reported"
                count={analytics.statusCounts.REPORTED || 0}
                color="bg-neutral-500"
              />
              <StatusItem
                status="Assigned"
                count={analytics.statusCounts.ASSIGNED || 0}
                color="bg-blue-500"
              />
              <StatusItem
                status="In Progress"
                count={analytics.statusCounts.IN_PROGRESS || 0}
                color="bg-warning-500"
              />
              <StatusItem
                status="Resolved"
                count={analytics.statusCounts.RESOLVED || 0}
                color="bg-success-500"
              />
              <StatusItem
                status="Closed"
                count={analytics.statusCounts.CLOSED || 0}
                color="bg-neutral-800"
              />
            </div>
          </div>
        )}

        {/* Staff/Management: Pending Assignments */}
        {!isStudent && analytics && (analytics.statusCounts?.REPORTED || 0) > 0 && (
          <div className="card border-l-4 border-l-warning-500 bg-warning-50 dark:bg-warning-950/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-warning-100 dark:bg-warning-900/30">
                  <AlertCircle className="h-6 w-6 text-warning-600 dark:text-warning-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">
                    Pending Assignments
                  </h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    {analytics.statusCounts.REPORTED} issue(s) waiting to be assigned
                  </p>
                </div>
              </div>
              <Link href="/issues?filter=unassigned">
                <Button variant="outline" className="gap-2">
                  View Issues
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* User Info Card */}
        <div className="card">
          <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-50 mb-4">
            Your Information
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <InfoItem label="Role" value={user?.role} />
            <InfoItem label="Email" value={user?.email} />
            {user?.hostel && <InfoItem label="Hostel" value={user.hostel.name} />}
            {user?.block && <InfoItem label="Block" value={user.block.name} />}
            {user?.roomNumber && <InfoItem label="Room" value={user.roomNumber} />}
            {user?.rollNumber && <InfoItem label="Roll No." value={user.rollNumber} />}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  color, 
  subtitle 
}: { 
  title: string; 
  value: number | string; 
  icon: React.ComponentType<{ className?: string }>; 
  color: string;
  subtitle: string;
}) {
  const colorClasses: Record<string, string> = {
    primary: 'bg-primary-50 dark:bg-primary-950/30 text-primary-600 dark:text-primary-400',
    success: 'bg-success-50 dark:bg-success-950/30 text-success-600 dark:text-success-400',
    warning: 'bg-warning-50 dark:bg-warning-950/30 text-warning-600 dark:text-warning-400',
    info: 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400',
  };

  return (
    <div className="card hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <div className={cn("p-2.5 rounded-xl", colorClasses[color])}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">{value}</p>
      <p className="text-sm text-neutral-500">{title}</p>
      <p className="text-xs text-neutral-400 mt-1">{subtitle}</p>
    </div>
  );
}

function QuickActionCard({ 
  href, 
  icon: Icon, 
  title, 
  description,
  color 
}: { 
  href: string; 
  icon: React.ComponentType<{ className?: string }>; 
  title: string; 
  description: string;
  color: string;
}) {
  const colorClasses: Record<string, string> = {
    primary: 'from-primary-50 to-primary-100 dark:from-primary-950 dark:to-primary-900 border-primary-200 dark:border-primary-800',
    warning: 'from-warning-50 to-warning-100 dark:from-warning-950 dark:to-warning-900 border-warning-200 dark:border-warning-800',
    info: 'from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800',
    neutral: 'from-neutral-50 to-neutral-100 dark:from-neutral-800 dark:to-neutral-900 border-neutral-200 dark:border-neutral-700',
  };

  return (
    <Link href={href} className="group">
      <div className={cn(
        "card h-28 transition-all duration-200 hover:shadow-lg hover:scale-[1.02]",
        "bg-gradient-to-br border",
        colorClasses[color]
      )}>
        <div className="flex items-center gap-3 h-full">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/80 dark:bg-neutral-900/50 shadow-sm group-hover:scale-110 transition-transform">
            <Icon className="h-5 w-5 text-neutral-700 dark:text-neutral-300" />
          </div>
          <div>
            <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">{title}</h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">{description}</p>
          </div>
        </div>
      </div>
    </Link>
  );
}

function StatusItem({ status, count, color }: { status: string; count: number; color: string }) {
  return (
    <div className="text-center p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/50">
      <p className="text-xl font-bold text-neutral-900 dark:text-neutral-50">{count}</p>
      <p className="text-xs text-neutral-500">{status}</p>
      <div className={cn("h-1 mt-2 rounded-full", color)}></div>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value?: string }) {
  return (
    <div className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/50">
      <p className="text-xs text-neutral-500 mb-1">{label}</p>
      <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate">{value || '-'}</p>
    </div>
  );
}
