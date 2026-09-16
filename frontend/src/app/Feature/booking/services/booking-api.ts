import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BookingRequest, Ticket, Seat } from '../models/seat.model';

@Service()
export class BookingApi {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:5000/api/v1';

  getSeatsForShowtime(showtimeId: string): Observable<Seat[]> {
    return this.http.get<Seat[]>(`${this.baseUrl}/seats?showtimeId=${showtimeId}`);
  }

  confirmBooking(request: BookingRequest): Observable<Ticket> {
    return this.http.post<Ticket>(`${this.baseUrl}/bookings`, request);
  }
}