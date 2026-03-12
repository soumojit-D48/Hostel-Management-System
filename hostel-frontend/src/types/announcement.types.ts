export type AnnouncementCategory =
  | 'CLEANING_SCHEDULE'
  | 'PEST_CONTROL'
  | 'MAINTENANCE_NOTICE'
  | 'WATER_ELECTRICITY'
  | 'GENERAL';

export interface Announcement {
  id: string;
  title: string;
  content: string;
  category: AnnouncementCategory;
  priority: boolean;
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
  targetRoles: ('STUDENT' | 'STAFF' | 'MANAGEMENT')[];
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
  priority: boolean;
  hostelId?: string;
  blockIds?: string[];
  targetRoles: ('STUDENT' | 'STAFF' | 'MANAGEMENT')[];
  images?: File[];
  attachments?: File[];
}