import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, map, catchError, of, finalize } from 'rxjs';
import { Seat, BookingRequest, Ticket } from '../models/seat.model';
import { BookingApi } from './booking-api';

@Injectable({
  providedIn: 'root'
})
export class Booking {
  private bookingApi = inject(BookingApi);

  // --- 1. New Showtimes State ---
  private showtimesSubject = new BehaviorSubject<any[]>([]);
  showtimes$: Observable<any[]> = this.showtimesSubject.asObservable();

  // --- Existing Seats State ---
  private seatsSubject = new BehaviorSubject<Seat[]>([]);
  seats$: Observable<Seat[]> = this.seatsSubject.asObservable();

  private selectedSeatsSubject = new BehaviorSubject<Seat[]>([]);
  selectedSeats$: Observable<Seat[]> = this.selectedSeatsSubject.asObservable();

  private loadingSubject = new BehaviorSubject<boolean>(false);
  loading$: Observable<boolean> = this.loadingSubject.asObservable();

  private errorSubject = new BehaviorSubject<string | null>(null);
  error$: Observable<string | null> = this.errorSubject.asObservable();

  totalPrice$: Observable<number> = this.selectedSeats$.pipe(
    map(seats => seats.reduce((sum, s) => sum + s.price, 0))
  );

  // --- 2. New Method to Load Showtimes ---
  loadShowtimesForMovie(movieId: string): void {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    this.bookingApi.getShowtimesForMovie(movieId).pipe(
      map(response => {
        // Adjust this depending on if your backend wraps it in { success, result }
        return response.result ? response.result : response; 
      }),
      catchError((err) => {
        console.error('Failed to load showtimes', err);
        this.errorSubject.next('Could not load showtimes. Please try again.');
        return of([]);
      }),
      finalize(() => this.loadingSubject.next(false))
    ).subscribe(showtimes => {
      this.showtimesSubject.next(showtimes);
    });
  }

  // --- Existing Methods ---
  loadSeatsForShow(showtimeId: string): void {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    this.bookingApi.getSeatsForShowtime(showtimeId).pipe(
      map(response => {
        const showPrice = response.result.showtime.price;
        return response.result.seats.map((seat: any) => ({
          id: `${seat.row}-${seat.number}`, 
          row: seat.row,
          number: seat.number,
          price: showPrice,
          type: seat.type || 'normal',
          status: seat.isBooked ? 'booked' : 'available'
        })) as Seat[];
      }),
      catchError((err) => {
        console.error('Failed to load seats', err);
        this.errorSubject.next('Could not load seats. Please try again.');
        return of([] as Seat[]);
      }),
      finalize(() => this.loadingSubject.next(false))
    ).subscribe(seats => {
      this.seatsSubject.next(seats);
    });
  }

  toggleSeat(seat: Seat): void {
    if (seat.status === 'booked') return;

    const current = this.selectedSeatsSubject.value;
    const exists = current.find(s => s.id === seat.id);

    if (exists) {
      this.selectedSeatsSubject.next(current.filter(s => s.id !== seat.id));
      seat.status = 'available';
    } else {
      this.selectedSeatsSubject.next([...current, seat]);
      seat.status = 'selected';
    }
  }

  confirmBooking(showId: string): Observable<Ticket> {
    const selected = this.selectedSeatsSubject.value;
    
    // We cast to 'any' here just in case your BookingRequest interface 
    // hasn't been updated to match the new { row, number } structure yet
    const request: any = {
      showtime: showId,
      seats: selected.map(s => ({ row: s.row, number: s.number }))
    };
    
    return this.bookingApi.confirmBooking(request).pipe(
      map(response => {
        const data = response.result;
        return {
          bookingId: data._id,
          movieTitle: data.showtime.movie.title,
          hallName: data.showtime.hall.name,
          showTime: data.showtime.startTime,
          seats: data.seats,
          totalPrice: data.totalPrice
        } as Ticket;
      })
    );
  }

  clearSelection(): void {
    this.selectedSeatsSubject.next([]);
  }
}