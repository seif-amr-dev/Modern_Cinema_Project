import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MovieService {

  private http = inject(HttpClient);

  private apiUrl = 'http://localhost:3000/movie';
  private showtimeUrl = 'http://localhost:3000/showtime'; 

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
}