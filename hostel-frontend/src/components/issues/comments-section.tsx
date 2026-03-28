'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { MessageSquare, Send, Edit, Trash2, X } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useComments } from '@/hooks/queries/use-comments';
import { 
  useCreateComment, 
} from '@/hooks/mutations/use-comment-mutations';
import { apiPatch, apiDelete } from '@/lib/api-client';
import { ApiResponse } from '@/types/api-response';
import { Comment, UpdateCommentRequest } from '@/types/comment.types';
import { createCommentSchema, type CreateCommentFormData } from '@/schemas';
import { Button } from '@/components/ui/button';
import { formatRelativeTime, getInitials } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface CommentsSectionProps {
  issueId?: string;
  announcementId?: string;
}

export function CommentsSection({ issueId, announcementId }: CommentsSectionProps) {
  const { user, isManagement } = useAuth();
  const resourceId = issueId || announcementId || '';
  const isAnnouncement = !!announcementId;
  
  const { data: comments, isLoading } = useComments(resourceId, isAnnouncement);
  const createComment = useCreateComment();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateCommentFormData>({
    resolver: zodResolver(createCommentSchema),
    defaultValues: {
      content: '',
    },
  });

  const onSubmit = async (data: CreateCommentFormData) => {
    const payload = issueId 
      ? { issueId, content: data.content }
      : { announcementId: announcementId!, content: data.content };
    
    await createComment.mutateAsync(payload);
    reset();
  };

  return (
    <div className="card">
      <div className="mb-6 flex items-center gap-2">
        <MessageSquare className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">
          Comments ({comments?.length || 0})
        </h3>
      </div>

      {/* New Comment Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="mb-6 space-y-3">
        <textarea
          {...register('content')}
          placeholder="Add a comment..."
          rows={3}
          className={cn(
            'w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm',
            'focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50',
            'dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100',
            errors.content && 'border-error-500'
          )}
        />
        {errors.content && (
          <p className="text-xs text-error-600 dark:text-error-400">
            {errors.content.message}
          </p>
        )}
        <div className="flex justify-end">
          <Button
            type="submit"
            className="btn-primary"
            disabled={createComment.isPending}
          >
            {createComment.isPending ? (
              <>
                <span className="spinner mr-2 h-4 w-4" />
                Posting...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Post Comment
              </>
            )}
          </Button>
        </div>
      </form>

      {/* Comments List */}
      {isLoading && (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="skeleton h-24 rounded-lg" />
          ))}
        </div>
      )}

      {!isLoading && comments && comments.length > 0 && (
        <div className="space-y-4">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              resourceId={resourceId}
              isAnnouncement={isAnnouncement}
              currentUserId={user?.id}
              isManagement={isManagement}
              editingId={editingId}
              editContent={editContent}
              onEdit={(id, content) => {
                setEditingId(id);
                setEditContent(content);
              }}
              onCancelEdit={() => {
                setEditingId(null);
                setEditContent('');
              }}
              onSaveEdit={(id, content) => {
                setEditingId(null);
                setEditContent('');
              }}
            />
          ))}
        </div>
      )}

      {!isLoading && (!comments || comments.length === 0) && (
        <div className="py-8 text-center">
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            No comments yet. Be the first to comment!
          </p>
        </div>
      )}
    </div>
  );
}

interface CommentItemProps {
  comment: Comment;
  resourceId: string;
  isAnnouncement: boolean;
  currentUserId?: string;
  isManagement?: boolean;
  editingId: string | null;
  editContent: string;
  onEdit: (id: string, content: string) => void;
  onCancelEdit: () => void;
  onSaveEdit: (id: string, content: string) => void;
}

function CommentItem({
  comment,
  resourceId,
  isAnnouncement,
  currentUserId,
  isManagement,
  editingId,
  editContent,
  onEdit,
  onCancelEdit,
  onSaveEdit,
}: CommentItemProps) {
  const queryClient = useQueryClient();
  
  const updateMutation = useMutation({
    mutationFn: async (data: UpdateCommentRequest) => {
      const response = await apiPatch<ApiResponse<Comment>>(`/comments/${comment.id}`, data);
      return response.data;
    },
    onSuccess: () => {
      const qk = isAnnouncement 
        ? ['comments', 'announcement', resourceId]
        : ['comments', 'issue', resourceId];
      queryClient.invalidateQueries({ queryKey: qk });
      toast.success('Comment updated');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update comment');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const response = await apiDelete<ApiResponse<void>>(`/comments/${comment.id}`);
      return response.data;
    },
    onSuccess: () => {
      const qk = isAnnouncement 
        ? ['comments', 'announcement', resourceId]
        : ['comments', 'issue', resourceId];
      queryClient.invalidateQueries({ queryKey: qk });
      toast.success('Comment deleted');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete comment');
    },
  });
  const [localEditContent, setLocalEditContent] = useState(comment.content);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const isOwner = currentUserId === comment.userId;
  const isAdmin = comment.user?.role === 'MANAGEMENT';
  const isEditing = editingId === comment.id;

  const handleSave = async () => {
    try {
      await updateMutation.mutateAsync({ content: localEditContent });
      onSaveEdit(comment.id, localEditContent);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleDelete = async () => {
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    setShowDeleteDialog(false);
    try {
      await deleteMutation.mutateAsync();
    } catch (error) {
      // Error handled by mutation
    }
  };

  return (
    <>
    <div className={`flex gap-3 rounded-lg p-4 ${isAdmin ? 'bg-primary-50 border-2 border-primary-200 dark:bg-primary-950/30 dark:border-primary-800' : 'bg-neutral-50 dark:bg-neutral-800'}`}>
      {/* Avatar */}
      <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${isAdmin ? 'bg-primary-500' : 'bg-primary-100 dark:bg-primary-950'}`}>
        <span className={`text-sm font-medium ${isAdmin ? 'text-white' : 'text-primary-600 dark:text-primary-400'}`}>
          {getInitials(comment.user.name)}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1">
        <div className="mb-1 flex items-center justify-between">
          <div>
            <span className={`font-medium ${isAdmin ? 'text-primary-700 dark:text-primary-300' : 'text-neutral-900 dark:text-neutral-50'}`}>
              {comment.user.name}
              {isAdmin && <span className="ml-2 text-xs bg-primary-200 text-primary-800 px-2 py-0.5 rounded-full dark:bg-primary-800 dark:text-primary-200">{comment?.user?.role}</span>}
            </span>
            <span className="ml-2 text-xs text-neutral-500 dark:text-neutral-400">
              {formatRelativeTime(comment.createdAt)}
              {comment.createdAt !== comment.updatedAt && (
                <span className="ml-1 italic text-neutral-400">(Edited)</span>
              )}
            </span>
          </div>
          {(isOwner || isManagement) && !isEditing && (
            <div className="flex gap-1">
              {isOwner && (
                <button
                  onClick={() => {
                    setLocalEditContent(comment.content);
                    onEdit(comment.id, comment.content);
                  }}
                  className="rounded p-1 text-neutral-600 hover:bg-neutral-200 dark:text-neutral-400 dark:hover:bg-neutral-700"
                >
                  <Edit className="h-4 w-4" />
                </button>
              )}
              <button
                onClick={handleDelete}
                className="rounded p-1 text-error-600 hover:bg-error-50 dark:text-error-400 dark:hover:bg-error-950"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {isEditing ? (
          <div className="space-y-2">
            <textarea
              value={localEditContent}
              onChange={(e) => setLocalEditContent(e.target.value)}
              rows={3}
              className={cn(
                'w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm',
                'focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50',
                'dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100'
              )}
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleSave}
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? 'Saving...' : 'Save'}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setLocalEditContent(comment.content);
                  onCancelEdit();
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-neutral-700 dark:text-neutral-300">
            {comment.content}
          </p>
        )}
      </div>
    </div>

    {showDeleteDialog && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-neutral-900">
          <h3 className="mb-2 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            Delete Comment
          </h3>
          <p className="mb-4 text-sm text-neutral-600 dark:text-neutral-400">
            Are you sure you want to delete this comment? This action cannot be undone.
          </p>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
              className="flex-1"
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </div>
      </div>
    )}
  </>
  );
}