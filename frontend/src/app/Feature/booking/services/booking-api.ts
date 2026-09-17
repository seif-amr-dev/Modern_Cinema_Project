import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BookingApi {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:3000/booking';

  getSeatsForShowtime(showtimeId: string): Observable<any> {
    return this.http.get<any>(`http://localhost:3000/booking/showtime/${showtimeId}/seats`);
  }

  confirmBooking(request: any): Observable<any> {
    return this.http.post<any>(this.baseUrl, request);
  }
  getShowtimesForMovie(movieId: string): Observable<any> {
    return this.http.get<any>(`http://localhost:3000/showtime?movie=${movieId}`);
  }

  getMyBookings(): Observable<any> {
    return this.http.get<any>(this.baseUrl);
  }
}