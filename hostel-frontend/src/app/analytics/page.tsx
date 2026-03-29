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

export default function AnalyticsPage() {
  const router = useRouter();
  const { isManagement, user } = useAuth();
  const { data: analytics, isLoading } = useDashboardAnalytics();

  const totalIssues = analytics?.totalIssues || 0;
  const resolutionRate = analytics?.resolutionRate || 0;
  const avgResponseTime = analytics?.avgResponseTimeHours || 0;
  const avgResolutionTime = analytics?.avgResolutionTimeHours || 0;

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
          {/* Issue Trends */}
          <div className="card">
            <h3 className="mb-4 text-lg font-semibold text-neutral-900 dark:text-neutral-50">
              Issue Trends
            </h3>
            <IssueTrendsChart />
          </div>

          {/* Category Breakdown */}
          <div className="card">
            <h3 className="mb-4 text-lg font-semibold text-neutral-900 dark:text-neutral-50">
              Issues by Category
            </h3>
            <CategoryBreakdownChart />
          </div>
        </div>

        {/* Staff Performance - Management Only */}
        {isManagement && (
          <div className="card">
            <h3 className="mb-4 text-lg font-semibold text-neutral-900 dark:text-neutral-50">
              Staff Performance
            </h3>
            <StaffPerformanceChart />
          </div>
        )}

        {/* Hostel Comparison - Management Only */}
        {isManagement && (
          <div className="card">
            <h3 className="mb-4 text-lg font-semibold text-neutral-900 dark:text-neutral-50">
              Hostel Comparison
            </h3>
            <HostelComparisonChart />
          </div>
        )}

        {/* Status Breakdown */}
        {analytics?.statusCounts && (
          <div className="card">
            <h3 className="mb-4 text-lg font-semibold text-neutral-900 dark:text-neutral-50">
              Issue Status Overview
            </h3>
            <div className="grid gap-4 md:grid-cols-5">
              {Object.entries(analytics.statusCounts).map(([status, count]) => (
                <div key={status} className="text-center p-4 rounded-lg bg-neutral-50 dark:bg-neutral-800">
                  <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
                    {count}
                  </p>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    {status.replace('_', ' ')}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
