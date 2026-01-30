'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { useLostFoundItem } from '@/hooks/queries/use-lost-found';
import { useCreateClaim } from '@/hooks/mutations/use-lost-found-mutations';
import { useAuth } from '@/hooks/use-auth';

function LostFoundDetailContent() {
  const params = useParams();
  const itemId = params.id as string;
  const { user } = useAuth();

  const { data: item, isLoading, error } = useLostFoundItem(itemId);
  const createClaim = useCreateClaim(itemId);

  const [showClaimForm, setShowClaimForm] = useState(false);
  const [claimData, setClaimData] = useState({
    verificationDetails: '',
    proofImage: null as File | null,
  });

  const isOwner = user?.id === item?.reportedBy.id;
  const hasClaimed = item?.claims?.some(c => c.claimantId === user?.id);

  const handleClaimSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await createClaim.mutateAsync({
        verificationDetails: claimData.verificationDetails,
        proofImage: claimData.proofImage || undefined,
      });
      setShowClaimForm(false);
      setClaimData({ verificationDetails: '', proofImage: null });
    } catch (error) {
      console.error('Claim error:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="min-h-screen bg-neutral-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-error-50 border border-error-200 text-error-700 px-4 py-3 rounded">
            Item not found
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="bg-white shadow">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 text-sm font-medium rounded ${
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
            <span className="px-3 py-1 text-sm font-medium rounded bg-neutral-100 text-neutral-700">
              {item.category}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Item Details */}
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-3xl font-bold text-neutral-900 mb-4">
            {item.itemName}
          </h1>

          <div className="prose max-w-none mb-6">
            <p className="text-neutral-700 whitespace-pre-wrap">{item.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-neutral-600">Location:</span>{' '}
              <strong>{item.location}</strong>
            </div>
            <div>
              <span className="text-neutral-600">Date:</span>{' '}
              <strong>{new Date(item.date).toLocaleDateString()}</strong>
            </div>
            <div>
              <span className="text-neutral-600">Reported by:</span>{' '}
              <strong>{item.reportedBy.name}</strong>
            </div>
            <div>
              <span className="text-neutral-600">Posted:</span>{' '}
              <strong>{new Date(item.createdAt).toLocaleDateString()}</strong>
            </div>
          </div>
        </div>

        {/* Images */}
        {item.images && item.images.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">Images</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {item.images.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`Image ${idx + 1}`}
                  className="w-full h-48 object-cover rounded cursor-pointer hover:opacity-90"
                  onClick={() => window.open(img, '_blank')}
                />
              ))}
            </div>
          </div>
        )}

        {/* Claim Button / Form */}
        {!isOwner && item.status !== 'RETURNED' && (
          <div className="bg-white rounded-lg shadow p-6">
            {hasClaimed ? (
              <div className="bg-info-50 border border-info-200 text-info-700 px-4 py-3 rounded">
                You have already claimed this item. Please wait for management review.
              </div>
            ) : showClaimForm ? (
              <form onSubmit={handleClaimSubmit} className="space-y-4">
                <h3 className="text-lg font-semibold text-neutral-900">Claim This Item</h3>
                
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Verification Details *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={claimData.verificationDetails}
                    onChange={(e) => setClaimData(prev => ({ ...prev, verificationDetails: e.target.value }))}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-md"
                    placeholder="Describe the item in detail to verify ownership..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Proof Image (Optional)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setClaimData(prev => ({ ...prev, proofImage: e.target.files?.[0] || null }))}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-md"
                  />
                </div>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setShowClaimForm(false)}
                    className="flex-1 px-4 py-2 border border-neutral-300 rounded-md hover:bg-neutral-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createClaim.isPending}
                    className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
                  >
                    {createClaim.isPending ? 'Submitting...' : 'Submit Claim'}
                  </button>
                </div>
              </form>
            ) : (
              <button
                onClick={() => setShowClaimForm(true)}
                className="w-full px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
              >
                Claim This Item
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function LostFoundDetailPage() {
  return (
    <ProtectedRoute>
      <LostFoundDetailContent />
    </ProtectedRoute>
  );
}