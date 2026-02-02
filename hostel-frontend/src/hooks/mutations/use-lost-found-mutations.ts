import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiPost, apiPatch, apiUpload } from '@/lib/api-client';
import { ApiResponse } from '@/types/api-response';
import {
  LostFoundItem,
  LostFoundClaim,
  CreateLostFoundRequest,
  CreateClaimRequest
} from '@/types/lost-found.types';
import { toast } from 'sonner';

export function useCreateLostFound() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateLostFoundRequest) => {
      const formData = new FormData();

      formData.append('itemName', data.itemName);
      formData.append('description', data.description);
      formData.append('category', data.category);
      formData.append('status', data.status);
      formData.append('location', data.location);
      formData.append('date', data.date);

      if (data.images && data.images.length > 0) {
        data.images.forEach(image => formData.append('images', image));
      }

      const response = await apiUpload<ApiResponse<{
        item: LostFoundItem;
        potentialMatches?: LostFoundItem[];
      }>>('/lost-found', formData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lost-found'] });
      toast.success('Item reported successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to report item');
    },
  });
}

export function useCreateClaim(itemId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateClaimRequest) => {
      const formData = new FormData();

      formData.append('verificationDetails', data.verificationDetails);

      if (data.proofImage) {
        formData.append('proofImage', data.proofImage);
      }

      const response = await apiUpload<ApiResponse<LostFoundClaim>>(
        `/lost-found/${itemId}/claim`,
        formData
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lost-found'] });
      queryClient.invalidateQueries({ queryKey: ['lost-found', itemId] });
      toast.success('Claim submitted successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to submit claim');
    },
  });
}

export function useUpdateClaim(claimId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { action: 'APPROVE' | 'REJECT'; remarks?: string }) => {
      const response = await apiPatch<ApiResponse<{
        claim: LostFoundClaim;
        contactInfo?: {
          reporter: { name: string; email: string; phone?: string };
          claimant: { name: string; email: string; phone?: string };
        };
      }>>(`/lost-found/claims/${claimId}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lost-found'] });
      toast.success('Claim updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update claim');
    },
  });
}

/**
 * Hook to mark a lost-found item as returned (Management only)
 */
export function useMarkItemReturned(itemId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await apiPatch<ApiResponse<{
        item: LostFoundItem;
        message: string;
      }>>(`/lost-found/${itemId}/returned`, {});
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lost-found'] });
      queryClient.invalidateQueries({ queryKey: ['lost-found', itemId] });
      queryClient.invalidateQueries({ queryKey: ['lost-found', 'claims', 'pending'] });
      toast.success('Item marked as returned');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to mark item as returned');
    },
  });
}