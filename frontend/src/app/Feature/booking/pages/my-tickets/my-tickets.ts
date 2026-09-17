import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Booking } from '../../services/booking';
import { Ticket } from '../../models/seat.model';
import { DigitalTicket } from '../../components/digital-ticket/digital-ticket';

@Component({
  selector: 'app-my-tickets',
  standalone: true,
  imports: [CommonModule, DigitalTicket],
  templateUrl: './my-tickets.html',
  styleUrl: './my-tickets.css'
})
export class MyTickets implements OnInit {
  private bookingService = inject(Booking);
  
  tickets = signal<Ticket[]>([]);
  isLoading = signal<boolean>(true);
  errorMessage = signal<string | null>(null);

  ngOnInit() {
    this.fetchTickets();
  }

  fetchTickets() {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    
    this.bookingService.getMyBookings().subscribe({
      next: (tickets) => {
        this.tickets.set(tickets);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error fetching tickets', err);
        this.errorMessage.set('Failed to load your tickets. Please try again.');
        this.isLoading.set(false);
      }
    });
  }
}
