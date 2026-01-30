export type IssueStatus = 
  | 'REPORTED' 
  | 'ASSIGNED' 
  | 'IN_PROGRESS' 
  | 'RESOLVED' 
  | 'CLOSED';

export type IssueCategory = 
  | 'PLUMBING' 
  | 'ELECTRICAL' 
  | 'FURNITURE' 
  | 'CLEANING' 
  | 'INTERNET' 
  | 'SECURITY' 
  | 'OTHER';

export type IssuePriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export type IssueVisibility = 'PUBLIC' | 'PRIVATE';

export interface Issue {
  id: string;
  title: string;
  description: string;
  category: IssueCategory;
  priority: IssuePriority;
  status: IssueStatus;
  visibility: IssueVisibility;
  images: string[];
  location?: string;
  roomNumber?: string;
  reportedBy: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  assignedTo?: {
    id: string;
    name: string;
    email: string;
  };
  hostel: {
    id: string;
    name: string;
  };
  block?: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

export interface CreateIssueRequest {
  title: string;
  description: string;
  category: IssueCategory;
  priority: IssuePriority;
  visibility: IssueVisibility;
  images?: File[];
  location?: string;
  roomNumber?: string;
}

export interface UpdateIssueStatusRequest {
  status: IssueStatus;
  remarks?: string;
}

export interface AssignIssueRequest {
  assignedToId: string;
  note?: string;
}