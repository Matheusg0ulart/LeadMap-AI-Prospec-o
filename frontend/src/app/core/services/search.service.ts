import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { SearchRequest, SearchResponse } from '../models/search.model';

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private http = inject(HttpClient);
  private api = inject(ApiService);

  search(request: SearchRequest): Observable<SearchResponse> {
    return this.http.post<SearchResponse>(`${this.api.baseUrl}/search`, request);
  }
}
