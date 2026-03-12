'use client';

import { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { debounce } from '@/lib/utils';

interface FilterValues {
  status?: string;
  category?: string;
  priority?: string;
  search?: string;
}

interface IssuesFilterBarProps {
  onFilterChange: (filters: FilterValues) => void;
}

const statuses = ['REPORTED', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
const categories = ['PLUMBING', 'ELECTRICAL', 'FURNITURE', 'CLEANLINESS', 'INTERNET', 'SECURITY', 'NOISE', 'OTHER'];
const priorities = ['LOW', 'MEDIUM', 'HIGH', 'EMERGENCY'];

export function IssuesFilterBar({ onFilterChange }: IssuesFilterBarProps) {
  const [filters, setFilters] = useState<FilterValues>({});
  const [searchInput, setSearchInput] = useState('');

  // Debounced search
  useEffect(() => {
    const debouncedSearch = debounce(() => {
      setFilters(prev => ({ ...prev, search: searchInput }));
    }, 500);

    debouncedSearch();
  }, [searchInput]);

  // Notify parent when filters change
  useEffect(() => {
    onFilterChange(filters);
  }, [filters, onFilterChange]);

  const handleFilterChange = (key: keyof FilterValues, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value === '' ? undefined : value,
    }));
  };

  const clearFilters = () => {
    setFilters({});
    setSearchInput('');
  };

  const hasActiveFilters = Object.values(filters).some(v => v !== undefined && v !== '');

  return (
    <div className="card space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
        <Input
          type="text"
          placeholder="Search issues..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Filters */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Status */}
        <div>
          <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Status
          </label>
          <select
            value={filters.status || ''}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className={cn(
              'w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm shadow-xs',
              'focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50',
              'dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100'
            )}
          >
            <option value="">All Statuses</option>
            {statuses.map(status => (
              <option key={status} value={status}>
                {status.replace('_', ' ')}
              </option>
            ))}
          </select>
        </div>

        {/* Category */}
        <div>
          <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Category
          </label>
          <select
            value={filters.category || ''}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className={cn(
              'w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm shadow-xs',
              'focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50',
              'dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100'
            )}
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {/* Priority */}
        <div>
          <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Priority
          </label>
          <select
            value={filters.priority || ''}
            onChange={(e) => handleFilterChange('priority', e.target.value)}
            className={cn(
              'w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm shadow-xs',
              'focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50',
              'dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100'
            )}
          >
            <option value="">All Priorities</option>
            {priorities.map(priority => (
              <option key={priority} value={priority}>
                {priority}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-neutral-600 dark:text-neutral-400"
          >
            <X className="mr-2 h-4 w-4" />
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
}