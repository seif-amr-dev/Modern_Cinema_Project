import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  CreateHallRequest,
  HallListResponse,
  HallMessageResponse,
  HallResponse,
  UpdateHallRequest,
} from '../models/hall.model';

@Injectable({
  providedIn: 'root',
})
export class HallService {
  private http = inject(HttpClient);

  private apiUrl = 'http://localhost:3000/hall';

  getHalls(): Observable<HallListResponse> {
    return this.http.get<HallListResponse>(this.apiUrl);
  }

  getHall(id: string): Observable<HallResponse> {
    return this.http.get<HallResponse>(`${this.apiUrl}/${id}`);
  }

  createHall(data: CreateHallRequest): Observable<HallResponse> {
    return this.http.post<HallResponse>(this.apiUrl, data);
  }

  updateHall(id: string, data: UpdateHallRequest): Observable<HallResponse> {
    return this.http.patch<HallResponse>(`${this.apiUrl}/${id}`, data);
  }

  deleteHall(id: string): Observable<HallMessageResponse> {
    return this.http.delete<HallMessageResponse>(`${this.apiUrl}/${id}`);
  }
}