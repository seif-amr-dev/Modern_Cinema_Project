import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { MovieService } from '../../../core/services/movie';
import {
  Movie,
  MovieStatus,
} from '../../../core/models/movie.model';
import { MovieForm, MovieFormSubmit } from './movie-form/movie-form';
import { MovieDelete } from './movie-delete/movie-delete';

type StatusFilter = 'all' | MovieStatus;

interface MovieStats {
  total: number;
  nowShowing: number;
  comingSoon: number;
  ended: number;
}

@Component({
  selector: 'app-movies',
  standalone: true,
  imports: [DatePipe, MovieForm, MovieDelete],
  templateUrl: './movies.html',
  styleUrl: './movies.css',
})
export class Movies {
  private movieService = inject(MovieService);

  protected readonly limit = 8;

  protected movies = signal<Movie[]>([]);
  protected listLoading = signal(true);
  protected reloading = signal(false);
  protected listError = signal<string | null>(null);

  protected searchText = signal('');
  protected statusFilter = signal<StatusFilter>('all');
  protected genreFilter = signal('');
  protected page = signal(1);
  protected pageCount = signal(1);
  protected total = signal(0);

  protected stats = signal<MovieStats | null>(null);

  protected formOpen = signal(false);
  protected formMode = signal<'create' | 'edit'>('create');
  protected editingMovie = signal<Movie | null>(null);
  protected formSaving = signal(false);
  protected formError = signal<string | null>(null);

  protected deleteTarget = signal<Movie | null>(null);
  protected deleteSaving = signal(false);
  protected deleteError = signal<string | null>(null);

  protected skeletonRows = [0, 1, 2, 3, 4, 5, 6, 7];

  protected statusTabs: { value: StatusFilter; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'now_showing', label: 'Now Showing' },
    { value: 'coming_soon', label: 'Coming Soon' },
    { value: 'ended', label: 'Ended' },
  ];

  protected busy = computed(() => this.formSaving() || this.deleteSaving());

  protected hasPrev = computed(
    () => this.page() > 1 && !this.reloading(),
  );
  protected hasNext = computed(
    () => this.page() < this.pageCount() && !this.reloading(),
  );

  protected genreOptions = computed(() => {
    const genres = new Set<string>();
    for (const movie of this.movies()) {
      for (const genre of movie.genre) {
        genres.add(genre);
      }
    }
    const current = this.genreFilter();
    if (current && !genres.has(current)) {
      genres.add(current);
    }
    return Array.from(genres).sort();
  });

  private searchDebounceId: ReturnType<typeof setTimeout> | null = null;
  private listSeq = 0;

  constructor() {
    void this.loadList();
    void this.loadStats();
  }

  protected loadList(): void {
    const seq = ++this.listSeq;
    const hasData = this.movies().length > 0;
    this.listError.set(null);
    if (hasData) {
      this.reloading.set(true);
    } else {
      this.listLoading.set(true);
    }

    const search = this.searchText().trim();
    const genre = this.genreFilter();
    const status = this.statusFilter() === 'all' ? undefined : this.statusFilter();

    void firstValueFrom(
      this.movieService.getMovies(search, genre, status, this.page(), this.limit),
    )
      .then((response) => {
        if (seq !== this.listSeq) {
          return;
        }
        this.movies.set(response.results);
        this.total.set(response.count);
        this.pageCount.set(Math.max(response.pages, 1));
        this.listLoading.set(false);
        this.reloading.set(false);
      })
      .catch((error: unknown) => {
        if (seq !== this.listSeq) {
          return;
        }
        this.listError.set(this.toErrorMessage(error));
        this.listLoading.set(false);
        this.reloading.set(false);
      });
  }

  protected loadStats(): Promise<void> {
    return Promise.all([
      firstValueFrom(this.movieService.getMovies(undefined, undefined, undefined, 1, 1)),
      firstValueFrom(this.movieService.getMovies(undefined, undefined, 'now_showing', 1, 1)),
      firstValueFrom(this.movieService.getMovies(undefined, undefined, 'coming_soon', 1, 1)),
      firstValueFrom(this.movieService.getMovies(undefined, undefined, 'ended', 1, 1)),
    ])
      .then(([total, nowShowing, comingSoon, ended]) => {
        this.stats.set({
          total: total.count,
          nowShowing: nowShowing.count,
          comingSoon: comingSoon.count,
          ended: ended.count,
        });
      })
      .catch(() => {
        this.stats.set(null);
      });
  }

  protected onSearchInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchText.set(value);
    if (this.searchDebounceId !== null) {
      clearTimeout(this.searchDebounceId);
    }
    this.searchDebounceId = setTimeout(() => {
      this.searchDebounceId = null;
      this.page.set(1);
      this.loadList();
    }, 400);
  }

  protected clearSearch(): void {
    if (this.searchDebounceId !== null) {
      clearTimeout(this.searchDebounceId);
      this.searchDebounceId = null;
    }
    this.searchText.set('');
    this.page.set(1);
    this.loadList();
  }

  protected setStatusFilter(value: StatusFilter): void {
    if (value === this.statusFilter()) {
      return;
    }
    this.statusFilter.set(value);
    this.page.set(1);
    this.loadList();
  }

  protected setGenreFilter(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    if (value === this.genreFilter()) {
      return;
    }
    this.genreFilter.set(value);
    this.page.set(1);
    this.loadList();
  }

  protected goToPage(target: number): void {
    if (this.reloading()) {
      return;
    }
    const next = Math.min(Math.max(target, 1), this.pageCount());
    if (next === this.page()) {
      return;
    }
    this.page.set(next);
    this.loadList();
  }

  protected statusLabel(status: MovieStatus): string {
    switch (status) {
      case 'now_showing':
        return 'Now Showing';
      case 'coming_soon':
        return 'Coming Soon';
      case 'ended':
        return 'Ended';
    }
  }

  protected openCreate(): void {
    this.formMode.set('create');
    this.editingMovie.set(null);
    this.formError.set(null);
    this.formOpen.set(true);
  }

  protected openEdit(movie: Movie): void {
    this.formMode.set('edit');
    this.editingMovie.set(movie);
    this.formError.set(null);
    this.formOpen.set(true);
  }

  protected closeForm(): void {
    if (this.formSaving()) {
      return;
    }
    this.formOpen.set(false);
  }

  protected async onFormSubmit(submit: MovieFormSubmit): Promise<void> {
    if (this.formSaving()) {
      return;
    }
    this.formSaving.set(true);
    this.formError.set(null);
    try {
      if (submit.mode === 'create') {
        await firstValueFrom(this.movieService.createMovie(submit.data));
        this.page.set(1);
      } else {
        const editing = this.editingMovie();
        if (!editing) {
          return;
        }
        await firstValueFrom(this.movieService.updateMovie(editing._id, submit.data));
      }
      this.formOpen.set(false);
      await this.loadStats();
      this.loadList();
    } catch (error) {
      this.formError.set(this.toErrorMessage(error));
    } finally {
      this.formSaving.set(false);
    }
  }

  protected confirmDelete(movie: Movie): void {
    this.deleteError.set(null);
    this.deleteTarget.set(movie);
  }

  protected closeDelete(): void {
    if (this.deleteSaving()) {
      return;
    }
    this.deleteTarget.set(null);
  }

  protected async runDelete(): Promise<void> {
    const movie = this.deleteTarget();
    if (!movie || this.deleteSaving()) {
      return;
    }
    this.deleteSaving.set(true);
    this.deleteError.set(null);
    try {
      await firstValueFrom(this.movieService.deleteMovie(movie._id));
      if (this.movies().length === 1 && this.page() > 1) {
        this.page.update((current) => current - 1);
      }
      this.deleteTarget.set(null);
      await this.loadStats();
      this.loadList();
    } catch (error) {
      this.deleteError.set(this.toErrorMessage(error));
    } finally {
      this.deleteSaving.set(false);
    }
  }

  private toErrorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      const body = error.error as { message?: unknown } | null;
      if (body && typeof body.message === 'string') {
        return body.message;
      }
      if (error.status === 0) {
        return 'Could not reach the server. Check your connection and try again.';
      }
    }
    if (error instanceof Error && error.message) {
      return error.message;
    }
    return 'Something went wrong. Please try again.';
  }
}