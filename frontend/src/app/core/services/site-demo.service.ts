import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SiteDemo } from '../models/site-demo.model';
import { Business } from '../models/business.model';

@Injectable({
  providedIn: 'root'
})
export class SiteDemoService {
  private apiUrl = 'http://localhost:8080/api/demo';

  constructor(private http: HttpClient) {}

  getDemo(businessId: number): Observable<SiteDemo> {
    return this.http.get<SiteDemo>(`${this.apiUrl}/${businessId}`);
  }

  generatePreview(business: Partial<Business>): Observable<SiteDemo> {
    return this.http.post<SiteDemo>(`${this.apiUrl}/preview`, business);
  }
}
