import {Component, Input} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Ticket} from '../../models/seat.model';

@Component({
  selector: 'app-digital-ticket', imports: [CommonModule],
  templateUrl: './digital-ticket.html',
  styleUrl: './digital-ticket.css',
})
export class DigitalTicket{
  @Input() ticket!: Ticket;
}