export type NotificationType = 
  | 'issue_created'
  | 'issue_status_updated'
  | 'issue_assigned'
  | 'issue_comment'
  | 'announcement_created'
  | 'lost_found_created'
  | 'lost_found_claim_created'
  | 'lost_found_claim_updated';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  userId: string;
  createdAt: string;
}