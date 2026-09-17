import { ChangeDetectorRef, Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MovieService } from '../../core/services/movie';

@Component({
  selector: 'app-movie-card',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './movie-card.html',
  styleUrl: './movie-card.css',
})
export class MovieCard {
  @Input() movie: any;
  
  private movieService = inject(MovieService);
  private cdr = inject(ChangeDetectorRef);

  showtimes: any[] = [];
  isShowingShowtimes = false;
  isLoadingShowtimes = false;

  toggleShowtimes() {
    this.isShowingShowtimes = !this.isShowingShowtimes;

    // Load showtimes only if we haven't loaded them yet and we are showing them
    if (this.isShowingShowtimes && this.showtimes.length === 0 && this.movie?._id) {
      this.isLoadingShowtimes = true;
      this.movieService.getShowtimesByMovieId(this.movie._id).subscribe({
        next: (response) => {
          this.showtimes = response.results || response;
          this.isLoadingShowtimes = false;
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error loading showtimes:', error);
          this.isLoadingShowtimes = false;
          this.cdr.detectChanges();
        }
      });
    }
  }
}
