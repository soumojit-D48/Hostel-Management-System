export type AnnouncementCategory = 
  | 'GENERAL'
  | 'MAINTENANCE'
  | 'EVENTS'
  | 'RULES'
  | 'EMERGENCY';

export interface Announcement {
  id: string;
  title: string;
  content: string;
  category: AnnouncementCategory;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  images?: string[];
  attachments?: {
    name: string;
    url: string;
    size: number;
  }[];
  hostel?: {
    id: string;
    name: string;
  };
  blocks?: {
    id: string;
    name: string;
  }[];
  targetRoles: ('STUDENT' | 'MANAGEMENT')[];
  createdBy: {
    id: string;
    name: string;
    email: string;
  };
  isRead?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAnnouncementRequest {
  title: string;
  content: string;
  category: AnnouncementCategory;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  hostelId?: string;
  blockIds?: string[];
  targetRoles: ('STUDENT' | 'MANAGEMENT')[];
  images?: File[];
  attachments?: File[];
}