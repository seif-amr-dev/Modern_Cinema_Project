import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  CreateMoviePayload,
  MessageResponse,
  MovieListResponse,
  MovieResponse,
  UpdateMoviePayload,
} from '../models/movie.model';

@Injectable({
  providedIn: 'root',
})
export class MovieService {
  private http = inject(HttpClient);

  private apiUrl = 'http://localhost:3000/movie';

  getMovies(
    search?: string,
    genre?: string,
    status?: string,
    page: number = 1,
    limit: number = 20,
  ): Observable<MovieListResponse> {
    let params = new HttpParams().set('page', page).set('limit', limit);

    if (search) {
      params = params.set('search', search);
    }

    if (genre) {
      params = params.set('genre', genre);
    }

    if (status) {
      params = params.set('status', status);
    }

    return this.http.get<MovieListResponse>(this.apiUrl, { params });
  }

  getMovie(id: string): Observable<MovieResponse> {
    return this.http.get<MovieResponse>(`${this.apiUrl}/${id}`);
  }

  getMovieById(id: string): Observable<MovieResponse> {
    return this.getMovie(id);
  }

  createMovie(payload: CreateMoviePayload): Observable<MovieResponse> {
    const formData = new FormData();
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

    return this.http.post<MovieResponse>(this.apiUrl, formData);
  }

  updateMovie(id: string, payload: UpdateMoviePayload): Observable<MovieResponse> {
    const formData = new FormData();
    this.appendIfDefined(formData, 'title', payload.title);
    this.appendIfDefined(formData, 'description', payload.description);
    this.appendIfDefined(formData, 'duration', this.toText(payload.duration));
    this.appendIfDefined(formData, 'ageRating', payload.ageRating);
    this.appendIfDefined(formData, 'score', this.toText(payload.score));
    this.appendIfDefined(formData, 'releaseDate', payload.releaseDate);
    this.appendIfDefined(formData, 'status', payload.status);
    if (payload.director) {
      formData.append('director', payload.director);
    }
    if (payload.trailerUrl) {
      formData.append('trailerUrl', payload.trailerUrl);
    }
    if (payload.genres) {
      for (const genre of payload.genres) {
        formData.append('genre', genre);
      }
    }
    if (payload.cast) {
      for (const name of payload.cast) {
        formData.append('cast', name);
      }
    }
    if (payload.poster) {
      formData.append('poster', payload.poster);
    }

    return this.http.patch<MovieResponse>(`${this.apiUrl}/${id}`, formData);
  }

  deleteMovie(id: string): Observable<MessageResponse> {
    return this.http.delete<MessageResponse>(`${this.apiUrl}/${id}`);
  }

  private appendIfDefined(
    formData: FormData,
    key: string,
    value: string | number | undefined,
  ): void {
    if (value !== undefined) {
      formData.append(key, String(value));
    }
  }

  private toText(value: string | number | undefined): string | undefined {
    return value === undefined ? undefined : String(value);
  }
}