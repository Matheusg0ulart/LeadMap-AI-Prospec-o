import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { DashboardSummary } from '../models/dashboard.model';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private http = inject(HttpClient);
  private api = inject(ApiService);

  getSummary(): Observable<DashboardSummary> {
    return this.http.get<DashboardSummary>(`${this.api.baseUrl}/dashboard/summary`);
  }
}
