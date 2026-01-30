export type LostFoundStatus = 'LOST' | 'FOUND' | 'CLAIMED' | 'RETURNED';

export type LostFoundCategory = 
  | 'ELECTRONICS'
  | 'CLOTHING'
  | 'BOOKS'
  | 'ACCESSORIES'
  | 'DOCUMENTS'
  | 'OTHER';

export interface LostFoundItem {
  id: string;
  itemName: string;
  description: string;
  category: LostFoundCategory;
  status: LostFoundStatus;
  location: string;
  date: string;
  images?: string[];
  reportedBy: {
    id: string;
    name: string;
    email: string;
  };
  hostel?: {
    id: string;
    name: string;
  };
  claims?: LostFoundClaim[];
  createdAt: string;
  updatedAt: string;
}

export interface LostFoundClaim {
  id: string;
  itemId: string;
  claimantId: string;
  claimant: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
  verificationDetails: string;
  proofImage?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  remarks?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLostFoundRequest {
  itemName: string;
  description: string;
  category: LostFoundCategory;
  status: LostFoundStatus;
  location: string;
  date: string;
  images?: File[];
}

export interface CreateClaimRequest {
  verificationDetails: string;
  proofImage?: File;
}