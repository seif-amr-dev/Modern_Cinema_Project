import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Booking } from '../../services/booking';
import { Seat } from '../../models/seat.model';

@Component({
  selector: 'app-seat-selection',
  imports: [CommonModule],
  templateUrl: './seat-selection.html',
  styleUrl: './seat-selection.css',
})
export class SeatSelection implements OnInit {
  @Input() showId!: string;

  booking = inject(Booking);
  seats$ = this.booking.seats$;
  loading$ = this.booking.loading$;
  error$ = this.booking.error$;

  ngOnInit() {
    this.booking.loadSeatsForShow(this.showId);
  }

  onSeatClick(seat: Seat) {
    this.booking.toggleSeat(seat);
  }
}