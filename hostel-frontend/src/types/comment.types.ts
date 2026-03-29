export interface Comment {
  id: string;
  content: string;
  issueId?: string;
  announcementId?: string;
  lostFoundId?: string;
  userId: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    role?: string;
  };
  parentId?: string;
  replies?: Comment[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateCommentRequest {
  issueId?: string;
  announcementId?: string;
  lostFoundId?: string;
  content: string;
  parentId?: string;
}

export interface UpdateCommentRequest {
  content: string;
}