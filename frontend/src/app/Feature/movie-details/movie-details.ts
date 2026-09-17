import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router'; // <-- 1. Added RouterLink
import { MovieService } from '../../core/services/movie';

@Component({
  selector: 'app-movie-details',
  standalone: true,
  imports: [CommonModule, RouterLink], // <-- 2. Added RouterLink to imports
  templateUrl: './movie-details.html',
  styleUrl: './movie-details.css',
})
export class MovieDetails implements OnInit {

  private route = inject(ActivatedRoute);
  private movieService = inject(MovieService);
  private cdr = inject(ChangeDetectorRef);

  movie: any = null;
  showtimes: any[] = []; // <-- 3. Added the showtimes array

  ngOnInit(): void {
    const movieId = this.route.snapshot.paramMap.get('id');

    if (movieId) {
      this.loadMovie(movieId);
      this.loadShowtimes(movieId); // <-- 4. Call the new method
    }
  }

  loadMovie(id: string): void {
    this.movieService.getMovieById(id).subscribe({
      next: (response) => {
        this.movie = response.result;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading movie:', error);
      }
    });
  }

  loadShowtimes(id: string): void {
    this.movieService.getShowtimesByMovieId(id).subscribe({
      next: (response) => {
        this.showtimes = response.results || response; 
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading showtimes:', error);
      }
    });
  }
}