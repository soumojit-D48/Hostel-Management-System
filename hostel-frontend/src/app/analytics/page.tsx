'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { useDashboardAnalytics } from '@/hooks/queries/use-analytics';
import { AppShell } from '@/components/layout';
import { StatCard } from '@/components/dashboard/stat-card';
import { CategoryBreakdownChart } from '@/components/analytics/category-breakdown-chart';
import { IssueTrendsChart } from '@/components/analytics/issue-trends-chart';
import { StaffPerformanceChart } from '@/components/analytics/staff-performance-chart';
import { HostelComparisonChart } from '@/components/analytics/hostel-comparison-chart';
import { BarChart3, TrendingUp, Users, Building2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AnalyticsPage() {
  const router = useRouter();
  const { isManagement } = useAuth();
  const { data: analytics } = useDashboardAnalytics();

  // Redirect if not management
  useEffect(() => {
    if (!isManagement) {
      toast.error('Access denied', {
        description: 'Only management can access analytics',
      });
      router.push('/dashboard');
    }
  }, [isManagement, router]);

  if (!isManagement) {
    return null;
  }

  const totalIssues = analytics?.totalIssues || 0;
  const resolutionRate = analytics?.resolutionRate || 0;
  const avgResponseTime = analytics?.avgResponseTimeHours || 0;
  const avgResolutionTime = analytics?.avgResolutionTimeHours || 0;

  return (
    <AppShell>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-50">
            Analytics Dashboard
          </h1>
          <p className="mt-2 text-neutral-600 dark:text-neutral-400">
            Comprehensive insights into hostel management performance
          </p>
        </div>

        {/* Summary Stats */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Issues"
            value={totalIssues}
            icon={BarChart3}
            color="primary"
          />
          <StatCard
            title="Resolution Rate"
            value={`${Math.round(resolutionRate)}%`}
            icon={TrendingUp}
            color="success"
          />
          <StatCard
            title="Avg Response Time"
            value={`${Math.round(avgResponseTime)}h`}
            icon={Users}
            color="info"
          />
          <StatCard
            title="Avg Resolution Time"
            value={`${Math.round(avgResolutionTime)}h`}
            icon={Building2}
            color="warning"
          />
        </div>

        {/* Charts Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Category Breakdown */}
          <div className="card">
            <h2 className="mb-4 text-lg font-semibold text-neutral-900 dark:text-neutral-50">
              Issues by Category
            </h2>
            <CategoryBreakdownChart />
          </div>

          {/* Issue Trends */}
          <div className="card">
            <h2 className="mb-4 text-lg font-semibold text-neutral-900 dark:text-neutral-50">
              Issue Trends
            </h2>
            <IssueTrendsChart />
          </div>

          {/* Staff Performance */}
          <div className="card">
            <h2 className="mb-4 text-lg font-semibold text-neutral-900 dark:text-neutral-50">
              Staff Performance
            </h2>
            <StaffPerformanceChart />
          </div>

          {/* Hostel Comparison */}
          <div className="card">
            <h2 className="mb-4 text-lg font-semibold text-neutral-900 dark:text-neutral-50">
              Hostel Comparison
            </h2>
            <HostelComparisonChart />
          </div>
        </div>

        {/* Additional Metrics */}
        {analytics && (
          <div className="card">
            <h2 className="mb-4 text-lg font-semibold text-neutral-900 dark:text-neutral-50">
              Detailed Metrics
            </h2>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-lg bg-neutral-50 p-4 dark:bg-neutral-800">
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  New Issues Today
                </p>
                <p className="mt-1 text-2xl font-bold text-neutral-900 dark:text-neutral-50">
                  {analytics.newIssuesToday}
                </p>
              </div>

              <div className="rounded-lg bg-neutral-50 p-4 dark:bg-neutral-800">
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Pending Assignments
                </p>
                <p className="mt-1 text-2xl font-bold text-neutral-900 dark:text-neutral-50">
                  {analytics.pendingAssignments}
                </p>
              </div>

              <div className="rounded-lg bg-neutral-50 p-4 dark:bg-neutral-800">
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Status Distribution
                </p>
                <div className="mt-2 space-y-1">
                  {analytics.statusCounts && Object.entries(analytics.statusCounts).map(([status, count]) => (
                    <div key={status} className="flex justify-between text-xs">
                      <span className="text-neutral-600 dark:text-neutral-400">
                        {status.replace('_', ' ')}
                      </span>
                      <span className="font-medium text-neutral-900 dark:text-neutral-50">
                        {count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}