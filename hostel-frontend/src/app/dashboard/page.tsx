'use client';

import { ProtectedRoute } from '@/components/auth/protected-route';
import { useAuth } from '@/hooks/use-auth';
import Link from 'next/link';

function DashboardContent() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-neutral-900">
            Smart Hostel Management
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-neutral-600">
              Welcome, <strong>{user?.name}</strong>
            </span>
            <button
              onClick={() => logout()}
              className="px-4 py-2 bg-error-600 text-white rounded-md hover:bg-error-700"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Dashboard</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-primary-50 border border-primary-200 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-primary-900">My Issues</h3>
              <p className="text-3xl font-bold text-primary-600">0</p>
            </div>
            <div className="bg-success-50 border border-success-200 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-success-900">Resolved</h3>
              <p className="text-3xl font-bold text-success-600">0</p>
            </div>
            <div className="bg-warning-50 border border-warning-200 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-warning-900">Pending</h3>
              <p className="text-3xl font-bold text-warning-600">0</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link
              href="/issues/new"
              className="block p-6 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-center"
            >
              <span className="text-lg font-semibold">Report Issue</span>
            </Link>
            <Link
              href="/issues"
              className="block p-6 bg-secondary-600 text-white rounded-lg hover:bg-secondary-700 text-center"
            >
              <span className="text-lg font-semibold">View All Issues</span>
            </Link>
            <Link
              href="/lost-found/new"
              className="block p-6 bg-info-600 text-white rounded-lg hover:bg-info-700 text-center"
            >
              <span className="text-lg font-semibold">Report Lost/Found</span>
            </Link>
          </div>
        </div>

        {/* User Info */}
        <div className="mt-6 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Your Information</h2>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <dt className="text-sm font-medium text-neutral-500">Email</dt>
              <dd className="mt-1 text-sm text-neutral-900">{user?.email}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-neutral-500">Role</dt>
              <dd className="mt-1 text-sm text-neutral-900">{user?.role}</dd>
            </div>
            {user?.rollNumber && (
              <div>
                <dt className="text-sm font-medium text-neutral-500">Roll Number</dt>
                <dd className="mt-1 text-sm text-neutral-900">{user.rollNumber}</dd>
              </div>
            )}
            {user?.hostel && (
              <div>
                <dt className="text-sm font-medium text-neutral-500">Hostel</dt>
                <dd className="mt-1 text-sm text-neutral-900">{user.hostel.name}</dd>
              </div>
            )}
            {user?.block && (
              <div>
                <dt className="text-sm font-medium text-neutral-500">Block</dt>
                <dd className="mt-1 text-sm text-neutral-900">{user.block.name}</dd>
              </div>
            )}
            {user?.roomNumber && (
              <div>
                <dt className="text-sm font-medium text-neutral-500">Room</dt>
                <dd className="mt-1 text-sm text-neutral-900">{user.roomNumber}</dd>
              </div>
            )}
          </dl>
        </div>
      </main>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}