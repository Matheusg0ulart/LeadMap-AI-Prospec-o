import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Lead, LeadCreateRequest, LeadStatus, LeadStatusUpdateRequest, LeadNotesUpdateRequest } from '../models/lead.model';

@Injectable({
  providedIn: 'root'
})
export class LeadService {
  private http = inject(HttpClient);
  private api = inject(ApiService);

  listLeads(status?: LeadStatus): Observable<Lead[]> {
    let params = new HttpParams();
    if (status) {
      params = params.set('status', status);
    }
    return this.http.get<Lead[]>(`${this.api.baseUrl}/leads`, { params });
  }

  getLeadById(id: number): Observable<Lead> {
    return this.http.get<Lead>(`${this.api.baseUrl}/leads/${id}`);
  }

  saveLead(request: LeadCreateRequest): Observable<Lead> {
    return this.http.post<Lead>(`${this.api.baseUrl}/leads`, request);
  }

  updateStatus(id: number, status: LeadStatus): Observable<Lead> {
    const body: LeadStatusUpdateRequest = { status };
    return this.http.patch<Lead>(`${this.api.baseUrl}/leads/${id}/status`, body);
  }

  updateNotes(id: number, notes: string): Observable<Lead> {
    const body: LeadNotesUpdateRequest = { notes };
    return this.http.put<Lead>(`${this.api.baseUrl}/leads/${id}/notes`, body);
  }

  deleteLead(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api.baseUrl}/leads/${id}`);
  }
}
