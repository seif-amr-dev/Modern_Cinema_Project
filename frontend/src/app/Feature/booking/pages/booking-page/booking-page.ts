import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';
import { Booking } from '../../services/booking';
import { Ticket } from '../../models/seat.model';
import { SeatSelection } from '../../components/seat-selection/seat-selection';
import { CheckoutSummary } from '../../components/checkout-summary/checkout-summary';
import { DigitalTicket } from '../../components/digital-ticket/digital-ticket';

@Component({
  selector: 'app-booking-page',
  standalone: true, // Added: Required when using the 'imports' array
  imports: [CommonModule, SeatSelection, CheckoutSummary, DigitalTicket],
  templateUrl: './booking-page.html',
  styleUrl: './booking-page.css',
})
export class BookingPage {
  private route = inject(ActivatedRoute);
  
  // Made public so your HTML template can easily read from the service
  public booking = inject(Booking); 

  showId = this.route.snapshot.paramMap.get('showId') ?? '';
  confirmedTicket: Ticket | null = null;

  selectedCount$ = this.booking.selectedSeats$.pipe(map(seats => seats.length));

  onConfirm() {
    this.booking.confirmBooking(this.showId).subscribe({
      next: (ticket) => {
        this.confirmedTicket = ticket;
        this.booking.clearSelection(); // Optional: clears seats after success
      },
      error: (err) => {
        console.error('Booking failed', err);
      }
    });
  }
}