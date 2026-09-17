import { Hall } from './hall.model';
import { Movie } from './movie.model';

export type ShowtimeStatus = 'upcoming' | 'live' | 'past';

export interface Showtime {
  _id: string;
  movie: Movie;
  hall: Hall;
  startTime: string;
  endTime: string;
  price: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ShowtimeRef {
  _id: string;
  movie: string;
  hall: string;
  startTime: string;
  endTime: string;
  price: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ShowtimeListResponse {
  success: boolean;
  count: number;
  results: Showtime[];
}

export interface ShowtimeResponse {
  success: boolean;
  result: Showtime;
}

export interface ShowtimeMutationResponse {
  success: boolean;
  result: ShowtimeRef;
}

export interface CreateShowtimeRequest {
  movie: string;
  hall: string;
  startTime: string;
  endTime: string;
  price: number;
}

export type UpdateShowtimeRequest = Partial<CreateShowtimeRequest>;