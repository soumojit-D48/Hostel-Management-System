'use client';

import Link from 'next/link';
import { LostFoundItem } from '@/types/lost-found.types';
import { formatRelativeTime } from '@/lib/utils';
import { Package, Calendar, MapPin, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LostFoundCardProps {
  item: LostFoundItem;
}

const statusColors = {
  LOST: 'badge-error',
  FOUND: 'badge-warning',
  CLAIMED: 'badge-info',
  RETURNED: 'badge-success',
};

const categoryColors = {
  ELECTRONICS: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400',
  CLOTHING: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400',
  BOOKS: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400',
  ACCESSORIES: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400',
  DOCUMENTS: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400',
  KEYS: 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400',
  OTHER: 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-400',
};

export function LostFoundCard({ item }: LostFoundCardProps) {
  return (
    <Link href={`/lost-found/${item.id}`}>
      <div className={cn(
        'card cursor-pointer transition-all duration-200',
        'hover:shadow-lg hover:-translate-y-1'
      )}>
        {/* Image Thumbnail */}
        {item.images && item.images.length > 0 ? (
          <div className="mb-4 aspect-video overflow-hidden rounded-lg bg-neutral-100 dark:bg-neutral-800">
            <img
              src={item.images[0]}
              alt={item.itemName}
              className="h-full w-full object-cover"
            />
          </div>
        ) : (
          <div className="mb-4 flex aspect-video items-center justify-center rounded-lg bg-neutral-100 dark:bg-neutral-800">
            <Package className="h-12 w-12 text-neutral-400 dark:text-neutral-500" />
          </div>
        )}

        {/* Header */}
        <div className="mb-3">
          <h3 className="line-clamp-2 text-lg font-semibold text-neutral-900 dark:text-neutral-50">
            {item.itemName}
          </h3>
        </div>

        {/* Badges */}
        <div className="mb-3 flex flex-wrap gap-2">
          <span className={cn('badge text-xs', statusColors[item.status])}>
            {item.status}
          </span>
          <span className={cn('badge text-xs', categoryColors[item.category])}>
            {item.category}
          </span>
          {item.claims && item.claims.length > 0 && (
            <span className="badge badge-info text-xs">
              {item.claims.length} {item.claims.length === 1 ? 'Claim' : 'Claims'}
            </span>
          )}
        </div>

        {/* Description Preview */}
        <p className="truncate-2 mb-4 text-sm text-neutral-600 dark:text-neutral-400">
          {item.description}
        </p>

        {/* Meta Info */}
        <div className="space-y-2 text-xs text-neutral-500 dark:text-neutral-400">
          <div className="flex items-center gap-2">
            <MapPin className="h-3.5 w-3.5" />
            <span className="truncate">{item.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-3.5 w-3.5" />
            <span>{formatRelativeTime(item.date)}</span>
          </div>
          <div className="flex items-center gap-2">
            <User className="h-3.5 w-3.5" />
            <span>By {item.reportedBy.name}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}