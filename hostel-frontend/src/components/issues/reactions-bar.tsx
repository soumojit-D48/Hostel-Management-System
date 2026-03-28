'use client';

import { useState } from 'react';
import { useReactionCounts, useUserReactions, useResourceReactions } from '@/hooks/queries/use-reactions';
import { useToggleReaction } from '@/hooks/mutations/use-toggle-reaction';
import { ReactionType } from '@/types/reaction.types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Users } from 'lucide-react';

interface ReactionsBarProps {
    issueId: string;
    resourceType?: 'issue' | 'announcement';
}

const reactions: Array<{
    type: ReactionType;
    emoji: string;
    label: string;
}> = [
        { type: 'helpful', emoji: '👍', label: 'Helpful' },
        { type: 'urgent', emoji: '🚨', label: 'Urgent' },
        { type: 'resolved', emoji: '✅', label: 'Resolved' },
        { type: 'watching', emoji: '👀', label: 'Watching' },
    ];

export function ReactionsBar({ issueId, resourceType = 'issue' }: ReactionsBarProps) {
    const [showReactionsModal, setShowReactionsModal] = useState(false);
    
    const { data: counts } = useReactionCounts(issueId, resourceType);
    const { data: userReactions } = useUserReactions({
        resourceId: issueId,
        resourceType
    });
    const { data: allReactions } = useResourceReactions({
        resourceId: issueId,
        resourceType,
        page: 1,
        limit: 50
    });
    const toggleReaction = useToggleReaction(issueId, resourceType);

    const handleToggle = async (type: ReactionType) => {
        try {
            await toggleReaction.mutateAsync({
                issueId,
                type,
            });
        } catch (error) {
            // Error handled by mutation
        }
    };

    const isActive = (type: ReactionType) => {
        return userReactions?.includes(type) || false;
    };

    const getReactionsByType = (type: ReactionType) => {
        if (!allReactions?.reactions) return [];
        return allReactions.reactions.filter((r: any) => r.type === type);
    };

    return (
        <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
                {reactions.map(({ type, emoji, label }) => {
                    const count = counts?.[type] || 0;
                    const active = isActive(type);

                    return (
                        <button
                            key={type}
                            onClick={() => handleToggle(type)}
                            disabled={toggleReaction.isPending}
                            className={cn(
                                'flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all',
                                'border-2',
                                active
                                    ? 'border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-950 dark:text-primary-300'
                                    : 'border-neutral-200 bg-white text-neutral-700 hover:border-primary-300 hover:bg-primary-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:border-primary-700 dark:hover:bg-primary-950',
                                toggleReaction.isPending && 'cursor-not-allowed opacity-50'
                            )}
                        >
                            <span className="text-lg">{emoji}</span>
                            <span>{label}</span>
                            {count > 0 && (
                                <span className={cn(
                                    'ml-1 rounded-full px-2 py-0.5 text-xs font-bold',
                                    active
                                        ? 'bg-primary-200 text-primary-800 dark:bg-primary-900 dark:text-primary-200'
                                        : 'bg-neutral-200 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300'
                                )}>
                                    {count}
                                </span>
                            )}
                        </button>
                    );
                })}
                
                <button
                    onClick={() => setShowReactionsModal(true)}
                    className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium border-2 border-neutral-200 bg-white text-neutral-700 hover:border-primary-300 hover:bg-primary-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
                >
                    <Users className="h-4 w-4" />
                    <span>View All</span>
                </button>
            </div>

            {showReactionsModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="mx-4 w-full max-w-md max-h-[80vh] overflow-y-auto rounded-lg bg-white p-6 shadow-xl dark:bg-neutral-900">
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                                Reactions
                            </h3>
                            <button
                                onClick={() => setShowReactionsModal(false)}
                                className="text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
                            >
                                ✕
                            </button>
                        </div>
                        
                        {reactions.map(({ type, emoji, label }) => {
                            const users = getReactionsByType(type);
                            if (users.length === 0) return null;
                            
                            return (
                                <div key={type} className="mb-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-lg">{emoji}</span>
                                        <span className="font-medium text-neutral-900 dark:text-neutral-100">
                                            {label}
                                        </span>
                                        <span className="text-sm text-neutral-500">
                                            ({users.length})
                                        </span>
                                    </div>
                                    <div className="ml-6 space-y-1">
                                        {users.map((reaction: any) => {
                                            const userRole = reaction.user?.role;
                                            const isAdmin = userRole === 'MANAGEMENT' || userRole === 'STAFF';
                                            
                                            return (
                                                <div key={reaction.id} className="flex items-center gap-2">
                                                    <span className="text-sm text-neutral-700 dark:text-neutral-300">
                                                        {reaction.user?.name || 'Unknown User'}
                                                    </span>
                                                    {isAdmin && (
                                                        <span className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full dark:bg-primary-900 dark:text-primary-300">
                                                            {userRole}
                                                        </span>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                        
                        {allReactions?.reactions?.length === 0 && (
                            <p className="text-center text-neutral-500">No reactions yet</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}