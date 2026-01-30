
'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useComments } from '@/hooks/queries/use-comments';
import {
  useCreateComment,
  useUpdateComment,
  useDeleteComment,
} from '@/hooks/mutations/use-comment-mutations';
import { Comment } from '@/types/comment.types';

interface CommentsSectionProps {
  issueId: string;
}

export function CommentsSection({ issueId }: CommentsSectionProps) {
  const { user } = useAuth();
  const { data: comments, isLoading } = useComments(issueId);
  const createComment = useCreateComment();

  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newComment.trim()) return;

    try {
      await createComment.mutateAsync({
        issueId,
        content: newComment,
      });
      setNewComment('');
    } catch (error) {
      console.error('Failed to create comment:', error);
    }
  };

  const handleSubmitReply = async (parentId: string) => {
    if (!replyContent.trim()) return;

    try {
      await createComment.mutateAsync({
        issueId,
        content: replyContent,
        parentId,
      });
      setReplyContent('');
      setReplyingTo(null);
    } catch (error) {
      console.error('Failed to create reply:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-neutral-200 rounded w-1/4"></div>
          <div className="h-20 bg-neutral-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-neutral-900 mb-4">
        Comments ({comments?.length || 0})
      </h3>

      {/* Add Comment Form */}
      <form onSubmit={handleSubmitComment} className="mb-6">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          rows={3}
          className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-primary-500 focus:border-primary-500 resize-none"
        />
        <div className="mt-2 flex justify-end">
          <button
            type="submit"
            disabled={createComment.isPending || !newComment.trim()}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {createComment.isPending ? 'Posting...' : 'Post Comment'}
          </button>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-4">
        {comments && comments.length > 0 ? (
          comments
            .filter(comment => !comment.parentId)
            .map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                issueId={issueId}
                currentUserId={user?.id}
                replies={comments.filter(c => c.parentId === comment.id)}
                replyingTo={replyingTo}
                setReplyingTo={setReplyingTo}
                replyContent={replyContent}
                setReplyContent={setReplyContent}
                onSubmitReply={handleSubmitReply}
              />
            ))
        ) : (
          <p className="text-neutral-500 text-sm text-center py-4">
            No comments yet. Be the first to comment!
          </p>
        )}
      </div>
    </div>
  );
}

interface CommentItemProps {
  comment: Comment;
  issueId: string;
  currentUserId?: string;
  replies?: Comment[];
  replyingTo: string | null;
  setReplyingTo: (id: string | null) => void;
  replyContent: string;
  setReplyContent: (content: string) => void;
  onSubmitReply: (parentId: string) => void;
  isReply?: boolean;
}

function CommentItem({
  comment,
  issueId,
  currentUserId,
  replies = [],
  replyingTo,
  setReplyingTo,
  replyContent,
  setReplyContent,
  onSubmitReply,
  isReply = false,
}: CommentItemProps) {
  const deleteComment = useDeleteComment(comment.id, issueId);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const updateComment = useUpdateComment(comment.id, issueId);

  const isOwner = currentUserId === comment.userId;

  const handleEdit = async () => {
    try {
      await updateComment.mutateAsync({ content: editContent });
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update comment:', error);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this comment?')) return;

    try {
      await deleteComment.mutateAsync();
    } catch (error) {
      console.error('Failed to delete comment:', error);
    }
  };

  return (
    <div className={`${isReply ? 'ml-8 mt-2' : ''}`}>
      <div className="flex gap-3">
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
            <span className="text-primary-700 text-sm font-semibold">
              {comment.user.name.charAt(0)}
            </span>
          </div>
        </div>

        <div className="flex-1">
          <div className="bg-neutral-50 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <div>
                <span className="font-medium text-neutral-900 text-sm">
                  {comment.user.name}
                </span>
                <span className="text-neutral-500 text-xs ml-2">
                  {new Date(comment.createdAt).toLocaleString()}
                </span>
              </div>

              {isOwner && (
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="text-xs text-primary-600 hover:text-primary-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={handleDelete}
                    className="text-xs text-error-600 hover:text-error-700"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>

            {isEditing ? (
              <div>
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full px-2 py-1 border border-neutral-300 rounded text-sm"
                  rows={2}
                />
                <div className="mt-2 flex gap-2">
                  <button
                    onClick={handleEdit}
                    disabled={updateComment.isPending}
                    className="px-3 py-1 text-xs bg-primary-600 text-white rounded hover:bg-primary-700"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-3 py-1 text-xs border border-neutral-300 rounded hover:bg-neutral-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-neutral-700 whitespace-pre-wrap">
                {comment.content}
              </p>
            )}
          </div>

          {!isReply && (
            <button
              onClick={() => setReplyingTo(comment.id)}
              className="mt-1 text-xs text-primary-600 hover:text-primary-700"
            >
              Reply
            </button>
          )}

          {replyingTo === comment.id && (
            <div className="mt-2">
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Write a reply..."
                className="w-full px-2 py-1 border border-neutral-300 rounded text-sm"
                rows={2}
              />
              <div className="mt-2 flex gap-2">
                <button
                  onClick={() => onSubmitReply(comment.id)}
                  className="px-3 py-1 text-xs bg-primary-600 text-white rounded hover:bg-primary-700"
                >
                  Reply
                </button>
                <button
                  onClick={() => {
                    setReplyingTo(null);
                    setReplyContent('');
                  }}
                  className="px-3 py-1 text-xs border border-neutral-300 rounded hover:bg-neutral-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Render Replies */}
          {replies.length > 0 && (
            <div className="mt-2 space-y-2">
              {replies.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  issueId={issueId}
                  currentUserId={currentUserId}
                  replyingTo={replyingTo}
                  setReplyingTo={setReplyingTo}
                  replyContent={replyContent}
                  setReplyContent={setReplyContent}
                  onSubmitReply={onSubmitReply}
                  isReply
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}