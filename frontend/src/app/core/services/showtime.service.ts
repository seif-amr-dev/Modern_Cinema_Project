import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  CreateShowtimeRequest,
  ShowtimeListResponse,
  ShowtimeMutationResponse,
  ShowtimeResponse,
  UpdateShowtimeRequest,
} from '../models/showtime.model';

@Injectable({
  providedIn: 'root',
})
export class ShowtimeService {
  private http = inject(HttpClient);

  private apiUrl = 'http://localhost:3000/showtime';

  getShowtimes(): Observable<ShowtimeListResponse> {
    return this.http.get<ShowtimeListResponse>(this.apiUrl);
  }

  getShowtime(id: string): Observable<ShowtimeResponse> {
    return this.http.get<ShowtimeResponse>(`${this.apiUrl}/${id}`);
  }

  createShowtime(data: CreateShowtimeRequest): Observable<ShowtimeMutationResponse> {
    return this.http.post<ShowtimeMutationResponse>(this.apiUrl, data);
  }

  updateShowtime(
    id: string,
    data: UpdateShowtimeRequest,
  ): Observable<ShowtimeMutationResponse> {
    return this.http.patch<ShowtimeMutationResponse>(`${this.apiUrl}/${id}`, data);
  }

  deleteShowtime(id: string): Observable<ShowtimeMutationResponse> {
    return this.http.delete<ShowtimeMutationResponse>(`${this.apiUrl}/${id}`);
  }
}