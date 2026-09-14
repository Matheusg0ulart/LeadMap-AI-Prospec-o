import { Business } from './business.model';

export type LeadStatus = 'NEW' | 'CONTACTED' | 'INTERESTED' | 'NEGOTIATING' | 'CONVERTED' | 'LOST';

export interface Lead {
  id: number;
  userId: number;
  business: Business;
  status: LeadStatus;
  statusLabel: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LeadCreateRequest {
  businessId: number;
  notes?: string;
}

export interface LeadStatusUpdateRequest {
  status: LeadStatus;
}

export interface LeadNotesUpdateRequest {
  notes: string;
}
