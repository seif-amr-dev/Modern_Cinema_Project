import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
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

export interface MoviesResponse {
  success: boolean;
  count: number;
  page: number;
  pages: number;
  results: Movie[];
}

@Injectable({
  providedIn: 'root'
})
export class MovieService {
  private http = inject(HttpClient);

  private apiUrl = 'http://localhost:3000/movie';
  private showtimeUrl = 'http://localhost:3000/showtime'; 

  // --- Front-end methods ---
  getMovies(
    search?: string,
    genre?: string,
    status?: string,
    page: number = 1,
    limit: number = 20
  ): Observable<any> {
    let params = new HttpParams()
      .set('page', page)
      .set('limit', limit);

    if (search) {
      params = params.set('search', search);
    }
    if (genre) {
      params = params.set('genre', genre);
    }
    if (status) {
      params = params.set('status', status);
    }

    return this.http.get<any>(this.apiUrl, { params });
  }

  getMovieById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  getShowtimesByMovieId(movieId: string): Observable<any> {
    let params = new HttpParams().set('movie', movieId);
    return this.http.get<any>('http://localhost:3000/showtime', { params });
  }

  // --- Admin methods ---
  createMovie(payload: any): Observable<any> {
    let formData = payload;
    if (!(payload instanceof FormData)) {
      formData = new FormData();
      formData.append('poster', payload.poster);
      formData.append('title', payload.title);
      formData.append('description', payload.description);
      formData.append('genre', JSON.stringify(payload.genres));
      formData.append('cast', JSON.stringify(payload.cast));
      formData.append('duration', String(payload.duration));
      formData.append('ageRating', payload.ageRating);
      formData.append('score', String(payload.score));
      formData.append('releaseDate', payload.releaseDate);
      formData.append('status', payload.status);
      if (payload.director) {
        formData.append('director', payload.director);
      }
      if (payload.trailerUrl) {
        formData.append('trailerUrl', payload.trailerUrl);
      }
    }
    return this.http.post<any>(`${this.apiUrl}`, formData);
  }

  getAllMovies(): Observable<MoviesResponse> {
    return this.http.get<MoviesResponse>(`${this.apiUrl}`);
  }
  
  updateMovie(id: string, payload: any): Observable<any> {
    let formData = payload;
    if (!(payload instanceof FormData)) {
      formData = new FormData();
      if (payload.title !== undefined) formData.append('title', String(payload.title));
      if (payload.description !== undefined) formData.append('description', String(payload.description));
      if (payload.duration !== undefined) formData.append('duration', String(payload.duration));
      if (payload.ageRating !== undefined) formData.append('ageRating', String(payload.ageRating));
      if (payload.score !== undefined) formData.append('score', String(payload.score));
      if (payload.releaseDate !== undefined) formData.append('releaseDate', String(payload.releaseDate));
      if (payload.status !== undefined) formData.append('status', String(payload.status));
      if (payload.director) {
        formData.append('director', payload.director);
      }
      if (payload.trailerUrl) {
        formData.append('trailerUrl', payload.trailerUrl);
      }
      if (payload.genres) {
        formData.append('genre', JSON.stringify(payload.genres));
      }
      if (payload.cast) {
        formData.append('cast', JSON.stringify(payload.cast));
      }
      if (payload.poster) {
        formData.append('poster', payload.poster);
      }
    }
    return this.http.patch<any>(`${this.apiUrl}/${id}`, formData);
  }

  deleteMovie(id: string) {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}