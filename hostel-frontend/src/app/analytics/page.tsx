'use client';

import { useState } from 'react';
import { ProtectedRoute } from '@/components/auth/protected-route';
import {
  useDashboardAnalytics,
  useCategoryBreakdown,
  useIssueTrends,
  useStaffPerformance,
} from '@/hooks/queries/use-analytics';

function AnalyticsContent() {
  const [trendDays, setTrendDays] = useState(7);

  const { data: dashboard, isLoading: dashboardLoading } = useDashboardAnalytics();
  const { data: categories, isLoading: categoriesLoading } = useCategoryBreakdown();
  const { data: trends, isLoading: trendsLoading } = useIssueTrends(trendDays);
  const { data: staffPerf, isLoading: staffLoading } = useStaffPerformance();

  if (dashboardLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-neutral-900">Analytics Dashboard</h1>
          <p className="text-sm text-neutral-600 mt-1">
            Overview of hostel management metrics
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Total Issues"
            value={dashboard?.totalIssues || 0}
            bgColor="bg-primary-50"
            textColor="text-primary-700"
          />
          <MetricCard
            title="New Today"
            value={dashboard?.newIssuesToday || 0}
            bgColor="bg-info-50"
            textColor="text-info-700"
          />
          <MetricCard
            title="Resolution Rate"
            value={`${dashboard?.resolutionRate || 0}%`}
            bgColor="bg-success-50"
            textColor="text-success-700"
          />
          <MetricCard
            title="Pending Assignments"
            value={dashboard?.pendingAssignments || 0}
            bgColor="bg-warning-50"
            textColor="text-warning-700"
          />
        </div>

        {/* Status Breakdown */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">
            Status Distribution
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {dashboard?.statusCounts && Object.entries(dashboard.statusCounts).map(([status, count]) => (
              <div key={status} className="text-center">
                <p className="text-2xl font-bold text-primary-600">{count}</p>
                <p className="text-sm text-neutral-600 mt-1">{status}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Average Times */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">
              Avg Resolution Time
            </h3>
            <p className="text-3xl font-bold text-primary-600">
              {dashboard?.avgResolutionTimeHours.toFixed(1) || 0}h
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">
              Avg Response Time
            </h3>
            <p className="text-3xl font-bold text-primary-600">
              {dashboard?.avgResponseTimeHours.toFixed(1) || 0}h
            </p>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">
            Issues by Category
          </h2>
          {categoriesLoading ? (
            <div className="animate-pulse space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-8 bg-neutral-200 rounded"></div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {categories?.map((cat) => (
                <div key={cat.category}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-neutral-700">{cat.category}</span>
                    <span className="text-neutral-600">
                      {cat.count} ({cat.percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-neutral-200 rounded-full h-2">
                    <div
                      className="bg-primary-600 h-2 rounded-full"
                      style={{ width: `${cat.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Trends */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-neutral-900">
              Issue Trends
            </h2>
            <select
              value={trendDays}
              onChange={(e) => setTrendDays(Number(e.target.value))}
              className="px-3 py-1 border border-neutral-300 rounded-md text-sm"
            >
              <option value={7}>Last 7 days</option>
              <option value={14}>Last 14 days</option>
              <option value={30}>Last 30 days</option>
            </select>
          </div>
          {trendsLoading ? (
            <div className="h-64 bg-neutral-100 rounded animate-pulse"></div>
          ) : (
            <div className="h-64 flex items-end justify-between gap-2">
              {trends?.map((trend) => (
                <div key={trend.date} className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full bg-primary-600 rounded-t"
                    style={{
                      height: `${(trend.count / Math.max(...(trends?.map(t => t.count) || [1]))) * 100}%`,
                      minHeight: trend.count > 0 ? '4px' : '0',
                    }}
                  ></div>
                  <p className="text-xs text-neutral-600 mt-2 rotate-45 origin-left">
                    {new Date(trend.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                  <p className="text-xs font-semibold text-neutral-900">{trend.count}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Staff Performance */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">
            Staff Performance
          </h2>
          {staffLoading ? (
            <div className="animate-pulse space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-16 bg-neutral-200 rounded"></div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-neutral-200">
                    <th className="text-left py-2 px-4 text-sm font-medium text-neutral-700">
                      Staff
                    </th>
                    <th className="text-center py-2 px-4 text-sm font-medium text-neutral-700">
                      Assigned
                    </th>
                    <th className="text-center py-2 px-4 text-sm font-medium text-neutral-700">
                      Resolved
                    </th>
                    <th className="text-center py-2 px-4 text-sm font-medium text-neutral-700">
                      Pending
                    </th>
                    <th className="text-center py-2 px-4 text-sm font-medium text-neutral-700">
                      Avg Time
                    </th>
                    <th className="text-center py-2 px-4 text-sm font-medium text-neutral-700">
                      Rate
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {staffPerf?.map((staff) => (
                    <tr key={staff.staffId} className="border-b border-neutral-100">
                      <td className="py-3 px-4 text-sm text-neutral-900">
                        {staff.name}
                      </td>
                      <td className="py-3 px-4 text-sm text-center text-neutral-700">
                        {staff.assignedCount}
                      </td>
                      <td className="py-3 px-4 text-sm text-center text-success-700">
                        {staff.resolvedCount}
                      </td>
                      <td className="py-3 px-4 text-sm text-center text-warning-700">
                        {staff.pendingCount}
                      </td>
                      <td className="py-3 px-4 text-sm text-center text-neutral-700">
                        {staff.avgResolutionTimeHours.toFixed(1)}h
                      </td>
                      <td className="py-3 px-4 text-sm text-center">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          staff.resolutionRate >= 80 
                            ? 'bg-success-100 text-success-700'
                            : staff.resolutionRate >= 60
                            ? 'bg-warning-100 text-warning-700'
                            : 'bg-error-100 text-error-700'
                        }`}>
                          {staff.resolutionRate}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MetricCard({ 
  title, 
  value, 
  bgColor, 
  textColor 
}: { 
  title: string; 
  value: string | number; 
  bgColor: string; 
  textColor: string;
}) {
  return (
    <div className={`${bgColor} rounded-lg p-6`}>
      <p className="text-sm text-neutral-600 mb-2">{title}</p>
      <p className={`text-3xl font-bold ${textColor}`}>{value}</p>
    </div>
  );
}

export default function AnalyticsPage() {
  return (
    <ProtectedRoute requireRole="MANAGEMENT">
      <AnalyticsContent />
    </ProtectedRoute>
  );
}