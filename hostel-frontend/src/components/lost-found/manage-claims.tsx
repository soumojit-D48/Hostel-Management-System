'use client';

import { useState } from 'react';
import { LostFoundItem, LostFoundClaim } from '@/types/lost-found.types';
import { useUpdateClaim } from '@/hooks/mutations/use-lost-found-mutations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatRelativeTime, getInitials } from '@/lib/utils';
import { Check, X, User, FileText, Image } from 'lucide-react';
import { toast } from 'sonner';

interface ManageClaimsProps {
    item: LostFoundItem;
}

export function ManageClaims({ item }: ManageClaimsProps) {
    const pendingClaims = item.claims?.filter(c => c.status === 'PENDING') || [];

    if (pendingClaims.length === 0) {
        return null;
    }

    return (
        <div className="card">
            <h3 className="mb-4 text-lg font-semibold text-neutral-900 dark:text-neutral-50">
                Pending Claims ({pendingClaims.length})
            </h3>

            <div className="space-y-4">
                {pendingClaims.map((claim) => (
                    <ClaimItem key={claim.id} claim={claim} />
                ))}
            </div>
        </div>
    );
}

function ClaimItem({ claim }: { claim: LostFoundClaim }) {
    const updateClaim = useUpdateClaim(claim.id);
    const [showApproveDialog, setShowApproveDialog] = useState(false);
    const [showRejectDialog, setShowRejectDialog] = useState(false);
    const [rejectRemarks, setRejectRemarks] = useState('');

    const handleApprove = async () => {
        setShowApproveDialog(false);
        try {
            await updateClaim.mutateAsync({ action: 'APPROVE' });
            toast.success('Claim approved. Contact information has been shared with both parties.');
        } catch (error) {
            // Error handled by mutation
        }
    };

    const handleReject = async () => {
        setShowRejectDialog(false);
        try {
            await updateClaim.mutateAsync({
                action: 'REJECT',
                remarks: rejectRemarks || undefined,
            });
            setRejectRemarks('');
        } catch (error) {
            // Error handled by mutation
        }
    };

    return (
        <>
        <div className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-700">
            {/* Claimant Info */}
            <div className="mb-3 flex items-start gap-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-950">
                    <span className="text-sm font-medium text-primary-600 dark:text-primary-400">
                        {getInitials(claim.claimant.name)}
                    </span>
                </div>
                <div className="flex-1">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium text-neutral-900 dark:text-neutral-50">
                                {claim.claimant.name}
                            </p>
                            <p className="text-xs text-neutral-600 dark:text-neutral-400">
                                {claim.claimant.email}
                            </p>
                        </div>
                        <span className="text-xs text-neutral-500">
                            {formatRelativeTime(claim.createdAt)}
                        </span>
                    </div>
                </div>
            </div>

            {/* Verification Details */}
            <div className="mb-3 rounded-lg bg-neutral-50 p-3 dark:bg-neutral-800">
                <div className="mb-1 flex items-center gap-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    <FileText className="h-4 w-4" />
                    Verification Details
                </div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    {claim.verificationDetails}
                </p>
            </div>

            {/* Proof Image */}
            {claim.proofImage && (
                <div className="mb-3">
                    <div className="mb-1 flex items-center gap-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
                        <Image className="h-4 w-4" />
                        Proof Image
                    </div>
                    <img
                        src={claim.proofImage}
                        alt="Proof"
                        className="h-32 w-full rounded-lg object-cover"
                    />
                </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
                <Button
                    onClick={() => setShowApproveDialog(true)}
                    disabled={updateClaim.isPending}
                    className="flex-1 bg-success-600 text-white hover:bg-success-700"
                    size="sm"
                >
                    {updateClaim.isPending ? (
                        <span className="spinner h-4 w-4" />
                    ) : (
                        <>
                            <Check className="mr-2 h-4 w-4" />
                            Approve
                        </>
                    )}
                </Button>
                <Button
                    onClick={() => setShowRejectDialog(true)}
                    disabled={updateClaim.isPending}
                    variant="destructive"
                    size="sm"
                    className="flex-1"
                >
                    <X className="mr-2 h-4 w-4" />
                    Reject
                </Button>
            </div>
        </div>

        {/* Approve Dialog */}
        {showApproveDialog && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-neutral-900">
                    <h3 className="mb-2 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                        Approve Claim
                    </h3>
                    <p className="mb-4 text-sm text-neutral-600 dark:text-neutral-400">
                        Are you sure you want to approve this claim? The claimant will be notified and contact information will be shared with both parties.
                    </p>
                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            onClick={() => setShowApproveDialog(false)}
                            className="flex-1"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleApprove}
                            disabled={updateClaim.isPending}
                            className="flex-1 bg-success-600 text-white hover:bg-success-700"
                        >
                            {updateClaim.isPending ? 'Approving...' : 'Approve'}
                        </Button>
                    </div>
                </div>
            </div>
        )}

        {/* Reject Dialog */}
        {showRejectDialog && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-neutral-900">
                    <h3 className="mb-2 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                        Reject Claim
                    </h3>
                    <p className="mb-4 text-sm text-neutral-600 dark:text-neutral-400">
                        Are you sure you want to reject this claim?
                    </p>
                    <div className="mb-4">
                        <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                            Reason (optional)
                        </label>
                        <Input
                            value={rejectRemarks}
                            onChange={(e) => setRejectRemarks(e.target.value)}
                            placeholder="Add a reason for rejection..."
                        />
                    </div>
                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setShowRejectDialog(false);
                                setRejectRemarks('');
                            }}
                            className="flex-1"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleReject}
                            disabled={updateClaim.isPending}
                            variant="destructive"
                            className="flex-1"
                        >
                            {updateClaim.isPending ? 'Rejecting...' : 'Reject'}
                        </Button>
                    </div>
                </div>
            </div>
        )}
        </>
    );
}