export interface Hostel {
  id: string;
  name: string;
  address?: string;
  capacity?: number;
  createdAt: string;
  updatedAt: string;
  _count?: {
    users: number;
    blocks: number;
    issues: number;
  };
}

export interface Block {
  id: string;
  name: string;
  hostelId: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    users: number;
    issues: number;
  };
}

export interface HostelWithBlocks extends Hostel {
  blocks: Block[];
}

export interface CreateHostelRequest {
  name: string;
  address?: string;
  capacity?: number;
}

export interface CreateBlockRequest {
  name: string;
  hostelId: string;
}