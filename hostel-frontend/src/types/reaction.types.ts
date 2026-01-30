
export type ReactionType = 'helpful' | 'urgent' | 'resolved' | 'watching';

export interface Reaction {
  id: string;
  type: ReactionType;
  userId: string;
  issueId?: string;
  announcementId?: string;
  user: {
    id: string;
    name: string;
  };
  createdAt: string;
}

export interface ReactionCounts {
  helpful: number;
  urgent: number;
  resolved: number;
  watching: number;
  userReactions: ReactionType[];
}

export interface ToggleReactionRequest {
  issueId?: string;
  announcementId?: string;
  type: ReactionType;
}