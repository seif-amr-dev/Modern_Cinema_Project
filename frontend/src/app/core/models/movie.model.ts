export type MovieStatus = 'coming_soon' | 'now_showing' | 'ended';

export type AgeRating = 'G' | 'PG' | 'PG-13' | 'R' | 'NC-17';

export interface MoviePoster {
  url: string;
  publicId: string;
}

export interface Movie {
  _id: string;
  title: string;
  description: string;
  poster: MoviePoster;
  genre: string[];
  duration: number;
  ageRating: AgeRating;
  score: number;
  releaseDate: string;
  status: MovieStatus;
  director?: string;
  cast: string[];
  trailerUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MovieListResponse {
  success: boolean;
  count: number;
  page: number;
  pages: number;
  results: Movie[];
}

export interface MovieResponse {
  success: boolean;
  result: Movie;
}

export interface MessageResponse {
  success: boolean;
  message: string;
}

export interface MovieFormValue {
  title: string;
  description: string;
  genres: string[];
  duration: number;
  ageRating: AgeRating;
  score: number;
  releaseDate: string;
  status: MovieStatus;
  director?: string;
  cast: string[];
  trailerUrl?: string;
}

export interface CreateMoviePayload extends MovieFormValue {
  poster: File;
}

export interface UpdateMoviePayload {
  title?: string;
  description?: string;
  genres?: string[];
  duration?: number;
  ageRating?: AgeRating;
  score?: number;
  releaseDate?: string;
  status?: MovieStatus;
  director?: string;
  cast?: string[];
  trailerUrl?: string;
  poster?: File;
}