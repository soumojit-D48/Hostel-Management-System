'use client';

import { useReactionCounts, useUserReactions } from '@/hooks/queries/use-reactions';
import { useToggleReaction } from '@/hooks/mutations/use-toggle-reaction';
import { ReactionType } from '@/types/reaction.types';
import { cn } from '@/lib/utils';

interface ReactionsBarProps {
    issueId: string;
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

export function ReactionsBar({ issueId }: ReactionsBarProps) {
    const { data: counts } = useReactionCounts(issueId);
    const { data: userReactions } = useUserReactions({
        resourceId: issueId,
        resourceType: 'issue'
    });
    const toggleReaction = useToggleReaction(issueId);

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
        return counts?.userReactions?.includes(type) || false;
    };

    return (
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
        </div>
    );
}