'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLostFoundItems } from '@/hooks/queries/use-lost-found';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { LostFoundStatus } from '@/types/lost-found.types';

function LostFoundListContent() {
  const [filters, setFilters] = useState({
    page: 1,
    limit: 12,
    status: '',
    category: '',
  });

  const { data, isLoading, error } = useLostFoundItems(filters);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  if (error) {
    return (
      <div className="min-h-screen bg-neutral-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-error-50 border border-error-200 text-error-700 px-4 py-3 rounded">
            Error loading items: {(error as any).message}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-neutral-900">Lost & Found</h1>
              <p className="text-sm text-neutral-600 mt-1">
                {data?.pagination.total || 0} items
              </p>
            </div>
            <Link
              href="/lost-found/new"
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
            >
              Report Item
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-md"
              >
                <option value="">All Status</option>
                <option value="LOST">Lost</option>
                <option value="FOUND">Found</option>
                <option value="CLAIMED">Claimed</option>
                <option value="RETURNED">Returned</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Category
              </label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-md"
              >
                <option value="">All Categories</option>
                <option value="ELECTRONICS">Electronics</option>
                <option value="CLOTHING">Clothing</option>
                <option value="BOOKS">Books</option>
                <option value="ACCESSORIES">Accessories</option>
                <option value="DOCUMENTS">Documents</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
          </div>
        </div>

        {/* Items Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
                <div className="h-48 bg-neutral-200 rounded mb-4"></div>
                <div className="h-4 bg-neutral-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-neutral-200 rounded w-full"></div>
              </div>
            ))}
          </div>
        ) : data?.data.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-neutral-500 text-lg">No items found</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data?.data.map((item) => (
                <Link
                  key={item.id}
                  href={`/lost-found/${item.id}`}
                  className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden"
                >
                  {item.images && item.images.length > 0 ? (
                    <img
                      src={item.images[0]}
                      alt={item.itemName}
                      className="w-full h-48 object-cover"
                    />
                  ) : (
                    <div className="w-full h-48 bg-neutral-200 flex items-center justify-center">
                      <span className="text-neutral-400 text-4xl">📦</span>
                    </div>
                  )}

                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded ${
                        item.status === 'LOST' 
                          ? 'bg-error-100 text-error-700'
                          : item.status === 'FOUND'
                          ? 'bg-success-100 text-success-700'
                          : item.status === 'CLAIMED'
                          ? 'bg-warning-100 text-warning-700'
                          : 'bg-neutral-100 text-neutral-700'
                      }`}>
                        {item.status}
                      </span>
                      <span className="text-xs text-neutral-500 px-2 py-1 bg-neutral-100 rounded">
                        {item.category}
                      </span>
                    </div>

                    <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                      {item.itemName}
                    </h3>
                    <p className="text-sm text-neutral-600 line-clamp-2 mb-3">
                      {item.description}
                    </p>

                    <div className="text-xs text-neutral-500 space-y-1">
                      <div>📍 {item.location}</div>
                      <div>📅 {new Date(item.date).toLocaleDateString()}</div>
                    </div>
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

export default function LostFoundListPage() {
  return (
    <ProtectedRoute>
      <LostFoundListContent />
    </ProtectedRoute>
  );
}