import { ChangeDetectorRef, Component , inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MovieCard } from '../movie-card/movie-card';
import { MovieService } from '../../core/services/movie';

@Component({
  selector: 'app-movie-grid',
  standalone: true,
  imports: [FormsModule, MovieCard],
  templateUrl: './movie-grid.html',
  styleUrl: './movie-grid.css',
})
export class MovieGrid {

  private movieService = inject(MovieService);
  private cdr = inject(ChangeDetectorRef);
  movies: any[] = [];

  searchTerm = '';
  selectedGenre = '';
  selectedStatus = '';

  ngOnInit(): void {
    this.loadMovies();
  }

  loadMovies(): void {
    this.movieService
      .getMovies(
        this.searchTerm,
        this.selectedGenre,
        this.selectedStatus
      )
      .subscribe({
        next: (response) => {
          this.movies = response.results;
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error loading movies:', error);
        }
      });
  }

  searchMovies(): void {
    this.loadMovies();
  }

  filterMovies(): void {
    this.loadMovies();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedGenre = '';
    this.selectedStatus = '';

    this.loadMovies();
  }
}
