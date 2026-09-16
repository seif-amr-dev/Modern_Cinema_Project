import {Component, inject } from '@angular/core';
import {CommonModule } from'@angular/common';
import {Booking } from '../../services/booking';

@Component({
  selector: 'app-checkout-summary',imports: [CommonModule],
  templateUrl: './checkout-summary.html',styleUrl: './checkout-summary.css',
})
export class CheckoutSummary{
  booking =inject(Booking);
  selectedSeats$ =this.booking.selectedSeats$;
  totalPrice$ =this.booking.totalPrice$;
}