import { Component, input, output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Showtime } from '../../../../core/models/showtime.model';

@Component({
  selector: 'app-showtime-delete',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './showtime-delete.html',
  styleUrl: './showtime-delete.css',
})
export class ShowtimeDelete {
  showtime = input.required<Showtime>();
  busy = input(false);
  serverError = input<string | null>(null);

  confirm = output<void>();
  close = output<void>();

  protected onConfirm(): void {
    if (this.busy()) {
      return;
    }
    this.confirm.emit();
  }

  protected onCancel(): void {
    if (this.busy()) {
      return;
    }
    this.close.emit();
  }

  protected onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.onCancel();
    }
  }
}