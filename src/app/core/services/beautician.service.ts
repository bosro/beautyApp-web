import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { BeauticianProfile } from '../models';

@Injectable({ providedIn: 'root' })
export class BeauticianService {
  constructor(private api: ApiService) {}

  search(params: {
    query?: string;
    category?: string;
    city?: string;
    region?: string;
    minRating?: number;
    page?: number;
    limit?: number;
    sortBy?: string;
  }): Observable<unknown> {
    return this.api.get('/beauticians/search', params as Record<string, unknown>);
  }

  getAll(params?: {
    page?: number;
    limit?: number;
    city?: string;
    region?: string;
    category?: string;
  }): Observable<unknown> {
    return this.api.get('/beauticians', params as Record<string, unknown>);
  }

  getById(id: string): Observable<unknown> {
    return this.api.get(`/beauticians/${id}`);
  }

  getNearby(params: {
    latitude: number;
    longitude: number;
    radius?: number;
    limit?: number;
  }): Observable<unknown> {
    return this.api.get('/beauticians/nearby', params as Record<string, unknown>);
  }

  getFeatured(): Observable<unknown> {
    return this.api.get('/beauticians/featured');
  }
}
