'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X, Upload } from 'lucide-react';
import { useCreateClaim } from '@/hooks/mutations/use-lost-found-mutations';
import { createClaimSchema, type CreateClaimFormData } from '@/schemas/lost-found.schema';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ClaimItemDialogProps {
  itemId: string;
  itemName: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ClaimItemDialog({
  itemId,
  itemName,
  isOpen,
  onClose,
  onSuccess,
}: ClaimItemDialogProps) {
  const createClaim = useCreateClaim(itemId);
  const [proofImage, setProofImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateClaimFormData>({
    resolver: zodResolver(createClaimSchema),
    defaultValues: {
      verificationDetails: '',
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image must be less than 5MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        toast.error('Only image files are allowed');
        return;
      }
      setProofImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (data: CreateClaimFormData) => {
    try {
      await createClaim.mutateAsync({
        verificationDetails: data.verificationDetails,
        proofImage: proofImage || undefined,
      });
      reset();
      setProofImage(null);
      setImagePreview(null);
      onSuccess();
      onClose();
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleClose = () => {
    reset();
    setProofImage(null);
    setImagePreview(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={handleClose}
      />
      
      <div className="modal-content relative z-10 w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-200 p-6 dark:border-neutral-700">
          <div>
            <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-50">
              Claim This Item
            </h2>
            <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
              {itemName}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="rounded-lg p-2 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Provide details to verify that this item belongs to you. Your claim will be reviewed by staff.
          </p>

          {/* Verification Details */}
          <div className="space-y-2">
            <label htmlFor="verificationDetails" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Verification Details <span className="text-error-600">*</span>
            </label>
            <textarea
              id="verificationDetails"
              rows={4}
              placeholder="Describe the item in detail (color, brand, unique features, when/where you lost it, etc.)"
              {...register('verificationDetails')}
              disabled={createClaim.isPending}
              className={cn(
                'w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm shadow-xs',
                'focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50',
                'disabled:cursor-not-allowed disabled:opacity-50',
                'dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100',
                errors.verificationDetails && 'border-error-500'
              )}
            />
            {errors.verificationDetails && (
              <p className="text-xs text-error-600 dark:text-error-400">
                {errors.verificationDetails.message}
              </p>
            )}
          </div>

          {/* Proof Image (Optional) */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Proof Image (Optional)
            </label>
            <div>
              <label
                htmlFor="proofImage"
                className="flex cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-neutral-300 p-6 transition-colors hover:border-primary-400 dark:border-neutral-700 dark:hover:border-primary-600"
              >
                <div className="text-center">
                  <Upload className="mx-auto h-8 w-8 text-neutral-400" />
                  <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
                    Upload proof of ownership
                  </p>
                  <p className="mt-1 text-xs text-neutral-500">
                    Receipt, photo with item, etc.
                  </p>
                </div>
                <input
                  id="proofImage"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  disabled={createClaim.isPending}
                  className="hidden"
                />
              </label>
            </div>
            {imagePreview && (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Proof"
                  className="h-32 w-full rounded-lg object-cover"
                />
                <button
                  type="button"
                  onClick={() => {
                    setProofImage(null);
                    setImagePreview(null);
                  }}
                  className="absolute right-2 top-2 rounded-full bg-error-600 p-1 text-white hover:bg-error-700"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={createClaim.isPending}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="btn-primary flex-1"
              disabled={createClaim.isPending}
            >
              {createClaim.isPending ? (
                <>
                  <span className="spinner mr-2 h-4 w-4" />
                  Submitting...
                </>
              ) : (
                'Submit Claim'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}