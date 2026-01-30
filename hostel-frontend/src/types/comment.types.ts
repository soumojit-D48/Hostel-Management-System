export interface Comment {
  id: string;
  content: string;
  issueId: string;
  userId: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  parentId?: string;
  replies?: Comment[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateCommentRequest {
  issueId: string;
  content: string;
  parentId?: string;
}

export interface UpdateCommentRequest {
  content: string;
}