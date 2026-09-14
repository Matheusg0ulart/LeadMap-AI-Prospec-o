import { Business } from './business.model';

export interface SearchRequest {
  location: string;
  category: string;
  radius: number;
}

export interface SearchResponse {
  searchId: number;
  location: string;
  category: string;
  radius: number;
  totalFound: number;
  withoutWebsiteCount: number;
  businesses: Business[];
}
