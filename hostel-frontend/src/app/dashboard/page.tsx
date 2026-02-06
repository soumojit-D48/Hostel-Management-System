// 'use client';

// import { ProtectedRoute } from '@/components/auth/protected-route';
// import { useAuth } from '@/hooks/use-auth';
// import Link from 'next/link';

// function DashboardContent() {
//     const { user, logout, isStudent, isStaff, isManagement } = useAuth();

//   return (
//     <div className="min-h-screen bg-neutral-50">
//       {/* Header */}
//       <header className="bg-white shadow">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
//           <h1 className="text-2xl font-bold text-neutral-900">
//             Smart Hostel Management
//           </h1>
//           <div className="flex items-center gap-4">
//             <span className="text-sm text-neutral-600">
//               Welcome, <strong>{user?.name}</strong>
//             </span>
//             <button
//               onClick={() => logout()}
//               className="px-4 py-2 bg-error-600 text-white rounded-md hover:bg-error-700"
//             >
//               Logout
//             </button>
//           </div>
//         </div>
//       </header>

//       {/* Main Content */}
//       <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         <div className="bg-white rounded-lg shadow p-6 mb-6">
//           <h2 className="text-xl font-semibold mb-4">Dashboard</h2>
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//             <div className="bg-primary-50 border border-primary-200 p-4 rounded-lg">
//               <h3 className="text-lg font-semibold text-primary-900">My Issues</h3>
//               <p className="text-3xl font-bold text-primary-600">0</p>
//             </div>
//             <div className="bg-success-50 border border-success-200 p-4 rounded-lg">
//               <h3 className="text-lg font-semibold text-success-900">Resolved</h3>
//               <p className="text-3xl font-bold text-success-600">0</p>
//             </div>
//             <div className="bg-warning-50 border border-warning-200 p-4 rounded-lg">
//               <h3 className="text-lg font-semibold text-warning-900">Pending</h3>
//               <p className="text-3xl font-bold text-warning-600">0</p>
//             </div>
//           </div>
//         </div>

//         {/* Quick Actions */}
//         <div className="bg-white rounded-lg shadow p-6">
//           <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//             <Link
//               href="/issues/new"
//               className="block p-6 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-center"
//             >
//               <span className="text-lg font-semibold">Report Issue</span>
//             </Link>
//             <Link
//               href="/issues"
//               className="block p-6 bg-secondary-600 text-white rounded-lg hover:bg-secondary-700 text-center"
//             >
//               <span className="text-lg font-semibold">View All Issues</span>
//             </Link>
//             <Link
//               href="/lost-found/new"
//               className="block p-6 bg-info-600 text-white rounded-lg hover:bg-info-700 text-center"
//             >
//               <span className="text-lg font-semibold">Report Lost/Found</span>
//             </Link>
//           </div>
//         </div>

//         {/* User Info */}
//         <div className="mt-6 bg-white rounded-lg shadow p-6">
//           <h2 className="text-xl font-semibold mb-4">My Information</h2>
//           <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <div>
//               <dt className="text-sm font-medium text-neutral-500">Email</dt>
//               <dd className="mt-1 text-sm text-neutral-900">{user?.email}</dd>
//             </div>
//             <div>
//               <dt className="text-sm font-medium text-neutral-500">Role</dt>
//               <dd className="mt-1 text-sm text-neutral-900">{user?.role}</dd>
//             </div>
//             {user?.rollNumber && (
//               <div>
//                 <dt className="text-sm font-medium text-neutral-500">Roll Number</dt>
//                 <dd className="mt-1 text-sm text-neutral-900">{user.rollNumber}</dd>
//               </div>
//             )}
//             {user?.hostel && (
//               <div>
//                 <dt className="text-sm font-medium text-neutral-500">Hostel</dt>
//                 <dd className="mt-1 text-sm text-neutral-900">{user.hostel.name}</dd>
//               </div>
//             )}
//             {user?.block && (
//               <div>
//                 <dt className="text-sm font-medium text-neutral-500">Block</dt>
//                 <dd className="mt-1 text-sm text-neutral-900">{user.block.name}</dd>
//               </div>
//             )}
//             {user?.roomNumber && (
//               <div>
//                 <dt className="text-sm font-medium text-neutral-500">Room</dt>
//                 <dd className="mt-1 text-sm text-neutral-900">{user.roomNumber}</dd>
//               </div>
//             )}
//           </dl>
//         </div>
//       </main>
//     </div>
//   );
// }

// export default function DashboardPage() {
//   return (
//     <ProtectedRoute>
//       <DashboardContent />
//     </ProtectedRoute>
//   );
// }














'use client';

import Link from 'next/link';
import { 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  TrendingUp,
  Plus,
  List,
  Package
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useDashboardAnalytics } from '@/hooks/queries/use-analytics';
import { AppShell } from '@/components/layout/app-shell';
import { StatCard } from '@/components/dashboard/stat-card';
import { DashboardSkeleton } from '@/components/dashboard/dashboard-skeleton';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function DashboardPage() {
  const { user } = useAuth();
  const { data: analytics, isLoading } = useDashboardAnalytics();

  if (isLoading) {
    return (
      <AppShell>
        <DashboardSkeleton />
      </AppShell>
    );
  }

  // Calculate stats from analytics data
  const totalIssues = analytics?.totalIssues || 0;
  const resolvedIssues = analytics?.statusCounts?.RESOLVED || 0;
  const pendingIssues = totalIssues - resolvedIssues;
  const avgResolutionTime = analytics?.avgResolutionTimeHours 
    ? Math.round(analytics.avgResolutionTimeHours) 
    : 0;
  const resolutionRate = analytics?.resolutionRate || 0;

  return (
    <AppShell>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-50">
            Welcome back, {user?.name}! 👋
          </h1>
          <p className="mt-2 text-neutral-600 dark:text-neutral-400">
            Here's what's happening in your hostel today
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Issues"
            value={totalIssues}
            icon={AlertCircle}
            color="primary"
          />
          <StatCard
            title="Resolved"
            value={resolvedIssues}
            icon={CheckCircle}
            color="success"
          />
          <StatCard
            title="Pending"
            value={pendingIssues}
            icon={Clock}
            color="warning"
          />
          <StatCard
            title="Avg Resolution Time"
            value={`${avgResolutionTime}h`}
            icon={TrendingUp}
            color="info"
          />
        </div>

        {/* Additional Stats Row */}
        {analytics && (
          <div className="grid gap-6 md:grid-cols-3">
            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                    New Today
                  </p>
                  <p className="mt-2 text-2xl font-bold text-neutral-900 dark:text-neutral-50">
                    {analytics.newIssuesToday}
                  </p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                    Resolution Rate
                  </p>
                  <p className="mt-2 text-2xl font-bold text-neutral-900 dark:text-neutral-50">
                    {Math.round(resolutionRate)}%
                  </p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                    Avg Response Time
                  </p>
                  <p className="mt-2 text-2xl font-bold text-neutral-900 dark:text-neutral-50">
                    {Math.round(analytics.avgResponseTimeHours)}h
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-50">
            Quick Actions
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            {/* Report New Issue */}
            <Link href="/issues/new" className="group">
              <div className={cn(
                'card h-24 transition-all duration-200',
                'hover:shadow-lg hover:scale-105',
                'bg-gradient-to-br from-primary-50 to-primary-100',
                'dark:from-primary-950 dark:to-primary-900',
                'border-2 border-primary-200 dark:border-primary-800'
              )}>
                <div className="flex h-full items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-600">
                    <Plus className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-neutral-900 dark:text-neutral-50">
                      Report New Issue
                    </h3>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      Create a new report
                    </p>
                  </div>
                </div>
              </div>
            </Link>

            {/* View All Issues */}
            <Link href="/issues" className="group">
              <div className={cn(
                'card h-24 transition-all duration-200',
                'hover:shadow-lg hover:scale-105'
              )}>
                <div className="flex h-full items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-neutral-100 dark:bg-neutral-800">
                    <List className="h-6 w-6 text-neutral-700 dark:text-neutral-300" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-neutral-900 dark:text-neutral-50">
                      View All Issues
                    </h3>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      Browse reports
                    </p>
                  </div>
                </div>
              </div>
            </Link>

            {/* Report Lost/Found */}
            <Link href="/lost-found/new" className="group">
              <div className={cn(
                'card h-24 transition-all duration-200',
                'hover:shadow-lg hover:scale-105'
              )}>
                <div className="flex h-full items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-neutral-100 dark:bg-neutral-800">
                    <Package className="h-6 w-6 text-neutral-700 dark:text-neutral-300" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-neutral-900 dark:text-neutral-50">
                      Report Lost/Found
                    </h3>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      Lost & Found items
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Status Breakdown */}
        {analytics?.statusCounts && (
          <div className="card">
            <h3 className="mb-4 text-lg font-semibold text-neutral-900 dark:text-neutral-50">
              Issue Status Breakdown
            </h3>
            <div className="grid gap-4 md:grid-cols-4">
              {Object.entries(analytics.statusCounts).map(([status, count]) => (
                <div key={status} className="text-center">
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

        
        {/* Pending Assignments Alert (for Staff/Management) */}
        {user?.role !== 'STUDENT' && analytics?.pendingAssignments > 0 && (
          <div className="alert alert-warning">
            <AlertCircle className="h-5 w-5" />
            <div className="flex-1">
              <p className="font-medium">Pending Assignments</p>
              <p className="text-sm">
                You have {analytics?.pendingAssignments} issue(s) waiting to be assigned.
              </p>
            </div>
            <Link href="/issues?filter=unassigned">
              <Button variant="outline" size="sm">
                View
              </Button>
            </Link>
          </div>
        )}
      </div>
    </AppShell>
  );
}