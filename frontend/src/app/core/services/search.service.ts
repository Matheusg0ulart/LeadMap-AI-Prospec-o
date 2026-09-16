import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { SearchRequest, SearchResponse } from '../models/search.model';
import { Business } from '../models/business.model';

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private http = inject(HttpClient);
  private api = inject(ApiService);

  search(request: SearchRequest): Observable<SearchResponse> {
    return this.http.post<SearchResponse>(`${this.api.baseUrl}/search`, request);
  }

  enrichCnpj(id: number): Observable<Business> {
    return this.http.post<Business>(`${this.api.baseUrl}/businesses/${id}/enrich-cnpj`, {});
  }

  analyzeSocial(id: number): Observable<any> {
    return this.http.post<any>(`${this.api.baseUrl}/businesses/${id}/analyze-social`, {});
  }

  getRoi(id: number, ticket?: number): Observable<any> {
    let url = `${this.api.baseUrl}/businesses/${id}/roi`;
    if (ticket && ticket > 0) {
      url += `?ticket=${ticket}`;
    }
    return this.http.get<any>(url);
  }

  getObjectionKit(id: number): Observable<any> {
    return this.http.get<any>(`${this.api.baseUrl}/businesses/${id}/objections`);
  }

  getCsvExportUrl(category?: string, websiteStatus?: string): string {
    let url = `${this.api.baseUrl}/businesses/export/csv`;
    const params: string[] = [];
    if (category && category !== 'ALL') params.push(`category=${encodeURIComponent(category)}`);
    if (websiteStatus && websiteStatus !== 'ALL') params.push(`websiteStatus=${encodeURIComponent(websiteStatus)}`);
    if (params.length > 0) url += '?' + params.join('&');
    return url;
  }

  getAuditReportUrl(id: number): string {
    return `${this.api.baseUrl}/businesses/${id}/audit-report`;
  }

  getContractUrl(id: number, value?: number, days?: number): string {
    let url = `${this.api.baseUrl}/businesses/${id}/contract`;
    const params: string[] = [];
    if (value && value > 0) params.push(`value=${value}`);
    if (days && days > 0) params.push(`days=${days}`);
    if (params.length > 0) url += '?' + params.join('&');
    return url;
  }
}
