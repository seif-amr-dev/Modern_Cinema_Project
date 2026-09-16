import { Service, inject } from '@angular/core';
import { BehaviorSubject, Observable, map, catchError, of, finalize } from 'rxjs';
import { Seat, BookingRequest, Ticket } from '../models/seat.model';
import { BookingApi } from './booking-api';

@Service()
export class Booking {
  private bookingApi = inject(BookingApi);

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

  loadSeatsForShow(showtimeId: string): void {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    this.bookingApi.getSeatsForShowtime(showtimeId).pipe(
      catchError(() => {
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
    const request: BookingRequest = {
      showId,
      seatIds: selected.map(s => s.id),
      totalPrice: selected.reduce((sum, s) => sum + s.price, 0)
    };
    return this.bookingApi.confirmBooking(request);
  }

  clearSelection(): void {
    this.selectedSeatsSubject.next([]);
  }
}