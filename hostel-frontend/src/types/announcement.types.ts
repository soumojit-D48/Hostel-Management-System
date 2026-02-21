export type AnnouncementCategory =
  | 'GENERAL'
  | 'MAINTENANCE'
  | 'EVENTS'
  | 'RULES'
  | 'EMERGENCY'
  | 'CLEANING_SCHEDULE'
  | 'PEST_CONTROL'
  | 'MAINTENANCE_NOTICE'
  | 'WATER_ELECTRICITY';

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
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  hostelId?: string;
  blockIds?: string[];
  targetRoles: ('STUDENT' | 'STAFF' | 'MANAGEMENT')[];
  images?: File[];
  attachments?: File[];
}