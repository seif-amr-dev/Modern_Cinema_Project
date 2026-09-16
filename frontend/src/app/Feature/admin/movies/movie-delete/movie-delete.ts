import { Component, input, output } from '@angular/core';
import { Movie } from '../../../../core/models/movie.model';

@Component({
  selector: 'app-movie-delete',
  standalone: true,
  templateUrl: './movie-delete.html',
  styleUrl: './movie-delete.css',
})
export class MovieDelete {
  movie = input.required<Movie>();
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