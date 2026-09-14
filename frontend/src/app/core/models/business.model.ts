export type WebsiteStatus = 'FOUND' | 'NOT_FOUND' | 'UNKNOWN';
export type PotentialLevel = 'ALTO POTENCIAL' | 'POTENCIAL MÉDIO' | 'BAIXO POTENCIAL';

export interface Business {
  id: number;
  externalId: string;
  name: string;
  category: string;
  address: string;
  latitude: number;
  longitude: number;
  phone?: string;
  website?: string;
  rating?: number;
  reviewCount?: number;
  instagram?: string;
  source: string;
  websiteStatus: WebsiteStatus;
  websiteStatusLabel: string;
  leadScore: number;
  potentialLevel: PotentialLevel;
  savedAsLead: boolean;
  leadId?: number;
  leadStatus?: string;
  suggestedDomain?: string;
  domainAvailable?: boolean;
  whatsappUrl?: string;
  whatsappPitch?: string;
  createdAt: string;
  updatedAt: string;
}
