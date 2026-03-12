'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar, MapPin, User, CheckCircle } from 'lucide-react';
import { useLostFoundItem } from '@/hooks/queries/use-lost-found';
import { useAuth } from '@/hooks/use-auth';
import { useMarkItemReturned } from '@/hooks/mutations/use-lost-found-mutations';
import { AppShell } from '@/components/layout';
import { IssueImagesGallery } from '@/components/issues/issue-images-gallery';
import { ClaimItemDialog } from '@/components/lost-found/claim-item-dialog';
import { ManageClaims } from '@/components/lost-found/manage-claims';
import { Button } from '@/components/ui/button';
import { formatRelativeTime } from '@/lib/utils';
import { cn } from '@/lib/utils';

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

export default function LostFoundDetailPage() {
  const params = useParams();
  const itemId = params.id as string;
  const { user, isStaffOrManagement } = useAuth();
  const { data: item, isLoading } = useLostFoundItem(itemId);
  const markReturned = useMarkItemReturned(itemId);
  const [showClaimDialog, setShowClaimDialog] = useState(false);

  const canClaim = item && item.status === 'FOUND' && item.reportedBy.id !== user?.id;
  const canManageClaims = isStaffOrManagement;
  const canMarkReturned = item && item.status === 'CLAIMED' && isStaffOrManagement;

  const handleMarkReturned = async () => {
    if (!confirm('Mark this item as returned? This action cannot be undone.')) {
      return;
    }
    try {
      await markReturned.mutateAsync();
    } catch (error) {
      // Error handled by mutation
    }
  };

  if (isLoading) {
    return (
      <AppShell>
        <div className="space-y-6">
          <div className="skeleton h-12 w-32" />
          <div className="skeleton h-64 rounded-xl" />
        </div>
      </AppShell>
    );
  }

  if (!item) {
    return (
      <AppShell>
        <div className="flex min-h-[400px] flex-col items-center justify-center text-center">
          <h2 className="mb-4 text-2xl font-bold text-neutral-900 dark:text-neutral-50">
            Item Not Found
          </h2>
          <Link href="/lost-found">
            <Button className="btn-primary">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Lost & Found
            </Button>
          </Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <Link href="/lost-found">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Lost & Found
          </Button>
        </Link>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="space-y-6 lg:col-span-2">
            {/* Header */}
            <div className="card">
              <h1 className="mb-4 text-3xl font-bold text-neutral-900 dark:text-neutral-50">
                {item.itemName}
              </h1>

              <div className="mb-4 flex flex-wrap gap-2">
                <span className={cn('badge', statusColors[item.status])}>
                  {item.status}
                </span>
                <span className={cn('badge', categoryColors[item.category])}>
                  {item.category}
                </span>
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-neutral-600 dark:text-neutral-400">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>{item.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{formatRelativeTime(item.date)}</span>
                </div>
              </div>
            </div>

            {/* Images */}
            {item.images && item.images.length > 0 && (
              <div className="card">
                <h3 className="mb-4 text-lg font-semibold text-neutral-900 dark:text-neutral-50">
                  Images
                </h3>
                <IssueImagesGallery images={item.images} />
              </div>
            )}

            {/* Description */}
            <div className="card">
              <h3 className="mb-4 text-lg font-semibold text-neutral-900 dark:text-neutral-50">
                Description
              </h3>
              <p className="whitespace-pre-wrap text-neutral-700 dark:text-neutral-300">
                {item.description}
              </p>
            </div>

            {/* Claim Button */}
            {canClaim && (
              <Button
                onClick={() => setShowClaimDialog(true)}
                className="btn-primary w-full"
              >
                Claim This Item
              </Button>
            )}

            {/* Mark as Returned */}
            {canMarkReturned && (
              <Button
                onClick={handleMarkReturned}
                disabled={markReturned.isPending}
                className="w-full bg-success-600 text-white hover:bg-success-700"
              >
                {markReturned.isPending ? (
                  <>
                    <span className="spinner mr-2 h-4 w-4" />
                    Marking as Returned...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Mark as Returned
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Reporter Info */}
            <div className="card">
              <h3 className="mb-3 font-semibold text-neutral-900 dark:text-neutral-50">
                Reported By
              </h3>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-950">
                  <User className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <p className="font-medium text-neutral-900 dark:text-neutral-50">
                    {item.reportedBy.name}
                  </p>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400">
                    {item.reportedBy.email}
                  </p>
                </div>
              </div>
            </div>

            {/* Manage Claims (Staff/Management only) */}
            {canManageClaims && <ManageClaims item={item} />}

            {/* Claims Count */}
            {item.claims && item.claims.length > 0 && (
              <div className="card">
                <h3 className="mb-2 font-semibold text-neutral-900 dark:text-neutral-50">
                  Claims
                </h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  {item.claims.length} {item.claims.length === 1 ? 'claim' : 'claims'} submitted
                </p>
                <div className="mt-3 space-y-1">
                  {item.claims.map((claim) => (
                    <div key={claim.id} className="flex items-center gap-2 text-xs">
                      <span className={cn(
                        'h-2 w-2 rounded-full',
                        claim.status === 'PENDING' && 'bg-warning-500',
                        claim.status === 'APPROVED' && 'bg-success-500',
                        claim.status === 'REJECTED' && 'bg-error-500'
                      )} />
                      <span className="text-neutral-600 dark:text-neutral-400">
                        {claim.claimant.name} - {claim.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Claim Dialog */}
      <ClaimItemDialog
        itemId={itemId}
        itemName={item.itemName}
        isOpen={showClaimDialog}
        onClose={() => setShowClaimDialog(false)}
        onSuccess={() => setShowClaimDialog(false)}
      />
    </AppShell>
  );
}