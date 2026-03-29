'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

const reportFoundSchema = z.object({
  foundMessage: z
    .string()
    .min(10, 'Please provide at least 10 characters')
    .max(500, 'Message must be less than 500 characters'),
  foundLocation: z
    .string()
    .min(2, 'Location is required')
    .max(200, 'Location must be less than 200 characters'),
});

type ReportFoundFormData = z.infer<typeof reportFoundSchema>;

interface ReportFoundDialogProps {
  itemId: string;
  itemName: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ReportFoundDialog({
  itemId,
  itemName,
  isOpen,
  onClose,
  onSuccess,
}: ReportFoundDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [foundImage, setFoundImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ReportFoundFormData>({
    resolver: zodResolver(reportFoundSchema),
    defaultValues: {
      foundMessage: '',
      foundLocation: '',
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFoundImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: ReportFoundFormData) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('foundMessage', data.foundMessage);
      formData.append('foundLocation', data.foundLocation);
      if (foundImage) {
        formData.append('foundImage', foundImage);
      }

      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/lost-found/${itemId}/found`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Failed to report found item');
      }

      toast.success('Found item reported! The owner has been notified.');
      reset();
      setFoundImage(null);
      setImagePreview(null);
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || 'Failed to report found item');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="mx-4 w-full max-w-md max-h-[90vh] overflow-y-auto rounded-lg bg-white p-6 shadow-xl dark:bg-neutral-900">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            I Found This Item
          </h3>
          <button
            onClick={onClose}
            className="text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="mb-4 text-sm text-neutral-600 dark:text-neutral-400">
          You found: <strong>{itemName}</strong>. Please provide details to help the owner identify their item.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Where did you find it? *
            </label>
            <Input
              {...register('foundLocation')}
              placeholder="e.g., Library, 2nd floor near the entrance"
            />
            {errors.foundLocation && (
              <p className="mt-1 text-xs text-error-600">{errors.foundLocation.message}</p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Message to the owner *
            </label>
            <textarea
              {...register('foundMessage')}
              placeholder="Describe how you found it or any identifying details..."
              className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm shadow-xs focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
              rows={4}
            />
            {errors.foundMessage && (
              <p className="mt-1 text-xs text-error-600">{errors.foundMessage.message}</p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Photo (optional)
            </label>
            <div className="flex items-center gap-4">
              <label className="flex cursor-pointer items-center gap-2 rounded-md border border-neutral-300 px-4 py-2 text-sm hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-800">
                <Upload className="h-4 w-4" />
                Upload Photo
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
              {imagePreview && (
                <div className="relative h-16 w-16 overflow-hidden rounded-lg">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-success-600 text-white hover:bg-success-700"
            >
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
