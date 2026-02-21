'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { MessageSquare, Send, Edit, Trash2, X } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useComments } from '@/hooks/queries/use-comments';
import { 
  useCreateComment, 
  useUpdateComment, 
  useDeleteComment 
} from '@/hooks/mutations/use-comment-mutations';
import { createCommentSchema, type CreateCommentFormData } from '@/schemas';
import { Comment } from '@/types/comment.types';
import { Button } from '@/components/ui/button';
import { formatRelativeTime, getInitials } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface CommentsSectionProps {
  issueId: string;
}

export function CommentsSection({ issueId }: CommentsSectionProps) {
  const { user } = useAuth();
  const { data: comments, isLoading } = useComments(issueId);
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
      issueId,
    },
  });

  const onSubmit = async (data: CreateCommentFormData) => {
    try {
      await createComment.mutateAsync({
        issueId,
        content: data.content,
      });
      reset();
    } catch (error) {
      // Error handled by mutation
    }
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
              issueId={issueId}
              currentUserId={user?.id}
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
  issueId: string;
  currentUserId?: string;
  editingId: string | null;
  editContent: string;
  onEdit: (id: string, content: string) => void;
  onCancelEdit: () => void;
  onSaveEdit: (id: string, content: string) => void;
}

function CommentItem({
  comment,
  issueId,
  currentUserId,
  editingId,
  editContent,
  onEdit,
  onCancelEdit,
  onSaveEdit,
}: CommentItemProps) {
  const updateComment = useUpdateComment(comment.id, issueId);
  const deleteComment = useDeleteComment(comment.id, issueId);
  const [localEditContent, setLocalEditContent] = useState(comment.content);

  const isOwner = currentUserId === comment.userId;
  const isEditing = editingId === comment.id;

  const handleSave = async () => {
    try {
      await updateComment.mutateAsync({ content: localEditContent });
      onSaveEdit(comment.id, localEditContent);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this comment?')) {
      try {
        await deleteComment.mutateAsync();
      } catch (error) {
        // Error handled by mutation
      }
    }
  };

  return (
    <div className="flex gap-3 rounded-lg bg-neutral-50 p-4 dark:bg-neutral-800">
      {/* Avatar */}
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-950">
        <span className="text-sm font-medium text-primary-600 dark:text-primary-400">
          {getInitials(comment.user.name)}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1">
        <div className="mb-1 flex items-center justify-between">
          <div>
            <span className="font-medium text-neutral-900 dark:text-neutral-50">
              {comment.user.name}
            </span>
            <span className="ml-2 text-xs text-neutral-500 dark:text-neutral-400">
              {formatRelativeTime(comment.createdAt)}
            </span>
          </div>
          {isOwner && !isEditing && (
            <div className="flex gap-1">
              <button
                onClick={() => {
                  setLocalEditContent(comment.content);
                  onEdit(comment.id, comment.content);
                }}
                className="rounded p-1 text-neutral-600 hover:bg-neutral-200 dark:text-neutral-400 dark:hover:bg-neutral-700"
              >
                <Edit className="h-4 w-4" />
              </button>
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
                disabled={updateComment.isPending}
              >
                {updateComment.isPending ? 'Saving...' : 'Save'}
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
  );
}