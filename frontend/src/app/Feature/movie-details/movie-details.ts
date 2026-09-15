import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MovieService } from '../../core/services/movie';

@Component({
  selector: 'app-movie-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './movie-details.html',
  styleUrl: './movie-details.css',
})
export class MovieDetails implements OnInit {

  private route = inject(ActivatedRoute);
  private movieService = inject(MovieService);

  movie: any = null;

  ngOnInit(): void {
    const movieId = this.route.snapshot.paramMap.get('id');

    if (movieId) {
      this.loadMovie(movieId);
    }
  }

  loadMovie(id: string): void {
    this.movieService.getMovieById(id).subscribe({
      next: (response) => {
        this.movie = response.result;
      },
      error: (error) => {
        console.error('Error loading movie:', error);
      }
    });
  }
}
