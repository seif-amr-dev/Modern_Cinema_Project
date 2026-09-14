import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Movie {
  _id: string;
  title: string;
  description: string;
  poster: { url: string; publicId: string };
  duration: number;
  ageRating: string;
  score?: number;
  releaseDate: string;
  status: string;
  director?: string;
  genre: string[];
  cast: string[];
  trailerUrl?: string;
}

interface MoviesResponse {
  success: boolean;
  count: number;
  page: number;
  pages: number;
  results: Movie[];
}

@Injectable({
  providedIn: 'root',
})
export class MovieService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/movie';

  createMovie(formData: FormData) {
    return this.http.post(`${this.apiUrl}`, formData);
  }

  getAllMovies(): Observable<MoviesResponse> {
    return this.http.get<MoviesResponse>(`${this.apiUrl}`);
  }
  updateMovie(id: string, formData: FormData) {
    return this.http.patch(`${this.apiUrl}/${id}`, formData);
  }

  deleteMovie(id: string) {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
