import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Business } from '../models/business.model';
import { AiAnalysis } from '../models/ai-analysis.model';

@Injectable({
  providedIn: 'root'
})
export class BusinessService {
  private http = inject(HttpClient);
  private api = inject(ApiService);

  listBusinesses(filters?: {
    category?: string;
    websiteStatus?: string;
    minScore?: number;
    maxScore?: number;
    minRating?: number;
  }): Observable<Business[]> {
    let params = new HttpParams();
    if (filters) {
      if (filters.category) params = params.set('category', filters.category);
      if (filters.websiteStatus) params = params.set('websiteStatus', filters.websiteStatus);
      if (filters.minScore !== undefined) params = params.set('minScore', filters.minScore.toString());
      if (filters.maxScore !== undefined) params = params.set('maxScore', filters.maxScore.toString());
      if (filters.minRating !== undefined) params = params.set('minRating', filters.minRating.toString());
    }
    return this.http.get<Business[]>(`${this.api.baseUrl}/businesses`, { params });
  }

  getBusinessById(id: number): Observable<Business> {
    return this.http.get<Business>(`${this.api.baseUrl}/businesses/${id}`);
  }

  analyze(id: number): Observable<AiAnalysis> {
    return this.http.post<AiAnalysis>(`${this.api.baseUrl}/businesses/${id}/analyze`, {});
  }
}
