import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class BookingService {
  constructor(private api: ApiService) {}

  create(data: {
    beauticianId: string;
    serviceId: string;
    date: string;
    time: string;
    note?: string;
  }): Observable<unknown> {
    return this.api.post('/bookings', data);
  }

  getMyBookings(params?: {
    page?: number;
    limit?: number;
    status?: string;
    startDate?: string;
    endDate?: string;
  }): Observable<unknown> {
    return this.api.get('/bookings/my-bookings', params as Record<string, unknown>);
  }

  getBeauticianBookings(beauticianId: string, params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Observable<unknown> {
    return this.api.get(`/bookings/beautician/${beauticianId}`, params as Record<string, unknown>);
  }

  getById(id: string): Observable<unknown> {
    return this.api.get(`/bookings/${id}`);
  }

  updateStatus(id: string, data: {
    status: string;
    cancellationReason?: string;
  }): Observable<unknown> {
    return this.api.put(`/bookings/${id}/status`, data);
  }

  checkAvailability(params: {
    beauticianId: string;
    date: string;
    time: string;
  }): Observable<unknown> {
    return this.api.post('/bookings/check-availability', params);
  }
}
