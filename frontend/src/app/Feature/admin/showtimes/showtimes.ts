import { Component, OnDestroy, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { MovieService } from '../../../core/services/movie';
import { HallService } from '../../../core/services/hall.service';
import { ShowtimeService } from '../../../core/services/showtime.service';
import { Movie } from '../../../core/models/movie.model';
import { Hall } from '../../../core/models/hall.model';
import { Showtime } from '../../../core/models/showtime.model';
import { ShowtimeForm, ShowtimeFormSubmit } from './showtime-form/showtime-form';
import { ShowtimeDelete } from './showtime-delete/showtime-delete';

export type ShowtimeStatusFilter = 'all' | 'upcoming' | 'live' | 'past';

interface ShowtimeStats {
  totalScheduled: number;
  upcoming: number;
  live: number;
  today: number;
}

interface ShowtimeCounts {
  all: number;
  upcoming: number;
  live: number;
  past: number;
}

interface ShowtimeGroup {
  key: string;
  label: string;
  kind: 'today' | 'tomorrow' | 'date';
  caption: string;
  items: Showtime[];
}

@Component({
  selector: 'app-showtimes',
  standalone: true,
  imports: [DatePipe, ShowtimeForm, ShowtimeDelete],
  providers: [DatePipe],
  templateUrl: './showtimes.html',
  styleUrl: './showtimes.css',
})
export class Showtimes implements OnDestroy {
  private showtimeService = inject(ShowtimeService);
  private movieService = inject(MovieService);
  private hallService = inject(HallService);
  private datePipe = inject(DatePipe);

  protected showtimes = signal<Showtime[]>([]);
  protected listLoading = signal(true);
  protected reloading = signal(false);
  protected listError = signal<string | null>(null);

  protected movies = signal<Movie[]>([]);
  protected halls = signal<Hall[]>([]);
  protected optionsLoading = signal(true);
  protected optionsError = signal<string | null>(null);

  protected statusFilter = signal<ShowtimeStatusFilter>('all');
  protected searchText = signal('');
  protected movieFilter = signal('');
  protected hallFilter = signal('');
  protected dateFilter = signal('');

  protected formOpen = signal(false);
  protected formMode = signal<'create' | 'edit'>('create');
  protected editingShowtime = signal<Showtime | null>(null);
  protected formSaving = signal(false);
  protected formError = signal<string | null>(null);

  protected deleteTarget = signal<Showtime | null>(null);
  protected deleteSaving = signal(false);
  protected deleteError = signal<string | null>(null);

  protected skeletonRows = [0, 1, 2, 3, 4, 5];

  protected statusTabs: { value: ShowtimeStatusFilter; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'upcoming', label: 'Upcoming' },
    { value: 'live', label: 'Live Now' },
    { value: 'past', label: 'Past' },
  ];

  protected busy = computed(() => this.formSaving() || this.deleteSaving());

  protected now = signal(Date.now());

  protected stats = computed<ShowtimeStats>(() => {
    const now = this.now();
    const todayKey = this.localDateKey(new Date());
    const list = this.showtimes();
    let upcoming = 0;
    let live = 0;
    let today = 0;
    for (const showtime of list) {
      const status = this.statusOf(showtime, now);
      if (status === 'upcoming') {
        upcoming += 1;
      } else if (status === 'live') {
        live += 1;
      }
      if (this.localDateKey(new Date(showtime.startTime)) === todayKey) {
        today += 1;
      }
    }
    return {
      totalScheduled: list.length,
      upcoming,
      live,
      today,
    };
  });

  protected statusCounts = computed<ShowtimeCounts>(() => {
    const now = this.now();
    const list = this.showtimes();
    let upcoming = 0;
    let live = 0;
    let past = 0;
    for (const showtime of list) {
      const status = this.statusOf(showtime, now);
      if (status === 'upcoming') {
        upcoming += 1;
      } else if (status === 'live') {
        live += 1;
      } else {
        past += 1;
      }
    }
    return { all: list.length, upcoming, live, past };
  });

  protected movieOptions = computed(() => {
    const list = [...this.movies()];
    const current = this.movieFilter();
    if (current && !list.some((movie) => movie._id === current)) {
      const existing = this.showtimes().find((showtime) => showtime.movie._id === current);
      if (existing) {
        list.unshift(existing.movie);
      }
    }
    return list.sort((a, b) => a.title.localeCompare(b.title));
  });

  protected hallOptions = computed(() => {
    const list = [...this.halls()];
    const current = this.hallFilter();
    if (current && !list.some((hall) => hall._id === current)) {
      const existing = this.showtimes().find((showtime) => showtime.hall._id === current);
      if (existing) {
        list.unshift(existing.hall);
      }
    }
    return list.sort((a, b) => a.name.localeCompare(b.name));
  });

  protected filtered = computed(() => {
    const status = this.statusFilter();
    const search = this.searchText().trim().toLowerCase();
    const movieId = this.movieFilter();
    const hallId = this.hallFilter();
    const date = this.dateFilter();
    const now = this.now();
    return this.showtimes().filter((showtime) => {
      if (search && !this.matchesSearch(showtime, search)) {
        return false;
      }
      if (movieId && showtime.movie._id !== movieId) {
        return false;
      }
      if (hallId && showtime.hall._id !== hallId) {
        return false;
      }
      if (date && this.localDateKey(new Date(showtime.startTime)) !== date) {
        return false;
      }
      if (status !== 'all' && this.statusOf(showtime, now) !== status) {
        return false;
      }
      return true;
    });
  });

  protected groups = computed<ShowtimeGroup[]>(() => {
    const todayKey = this.localDateKey(new Date());
    const map = new Map<string, ShowtimeGroup>();
    for (const showtime of this.filtered()) {
      const start = new Date(showtime.startTime);
      const key = this.localDateKey(start);
      let group = map.get(key);
      if (!group) {
        const date = this.localMidnight(start);
        const kind = this.groupKind(date);
        group = {
          key,
          label: this.groupLabel(date),
          kind,
          caption: this.groupCaption(kind),
          items: [],
        };
        map.set(key, group);
      }
      group.items.push(showtime);
    }
    const groups = Array.from(map.values());
    if (groups.length === 0) {
      return groups;
    }
    const hasToday = groups.some((group) => group.key === todayKey);
    return groups.sort((a, b) =>
      hasToday ? this.sortByDistanceFromToday(a, b) : a.key.localeCompare(b.key),
    );
  });

  private timerId: ReturnType<typeof setInterval> | null = null;

  constructor() {
    void this.loadShowtimes();
    void this.loadOptions();
    this.timerId = setInterval(() => this.now.set(Date.now()), 30000);
  }

  ngOnDestroy(): void {
    if (this.timerId !== null) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  async loadShowtimes(quiet = false): Promise<void> {
    if (!quiet) {
      this.listLoading.set(true);
      this.listError.set(null);
    } else {
      this.reloading.set(true);
      this.listError.set(null);
    }
    try {
      const response = await firstValueFrom(this.showtimeService.getShowtimes());
      this.showtimes.set(response.results);
      this.listError.set(null);
    } catch (error) {
      this.listError.set(this.toErrorMessage(error));
    } finally {
      this.listLoading.set(false);
      this.reloading.set(false);
    }
  }

  async loadOptions(quiet = false): Promise<void> {
    if (!quiet) {
      this.optionsLoading.set(true);
      this.optionsError.set(null);
    }
    try {
      const [movieResponse, hallResponse] = await Promise.all([
        firstValueFrom(this.movieService.getMovies(undefined, undefined, undefined, 1, 50)),
        firstValueFrom(this.hallService.getHalls()),
      ]);
      this.movies.set(movieResponse.results);
      this.halls.set(hallResponse.results);
      this.optionsError.set(null);
    } catch (error) {
      if (!quiet) {
        this.optionsError.set(this.toErrorMessage(error));
      }
    } finally {
      this.optionsLoading.set(false);
    }
  }

  protected statusOf(showtime: Showtime, now: number): ShowtimeStatusFilter {
    const start = new Date(showtime.startTime).getTime();
    const end = new Date(showtime.endTime).getTime();
    if (now < start) {
      return 'upcoming';
    }
    if (now > end) {
      return 'past';
    }
    return 'live';
  }

  protected matchesSearch(showtime: Showtime, search: string): boolean {
    const title = showtime.movie.title.toLowerCase();
    const hallName = showtime.hall.name.toLowerCase();
    return title.includes(search) || hallName.includes(search);
  }

  protected hallCapacity(hall: Hall): number {
    return hall.capacity ?? hall.rows * hall.seatsPerRow;
  }

  protected durationMinutes(showtime: Showtime): number {
    const minutes =
      (new Date(showtime.endTime).getTime() - new Date(showtime.startTime).getTime()) / 60000;
    return Number.isFinite(minutes) ? Math.round(minutes) : 0;
  }

  protected formatMinutes(minutes: number): string {
    const total = Math.max(Math.round(minutes), 0);
    const hours = Math.floor(total / 60);
    const mins = total % 60;
    if (hours === 0) {
      return `${mins}m`;
    }
    if (mins === 0) {
      return `${hours}h`;
    }
    return `${hours}h ${mins}m`;
  }

  protected priceLabel(price: number): string {
    return `$${price.toFixed(2)}`;
  }

  protected setStatusFilter(value: ShowtimeStatusFilter): void {
    if (value === this.statusFilter()) {
      return;
    }
    this.statusFilter.set(value);
  }

  protected onSearchInput(event: Event): void {
    this.searchText.set((event.target as HTMLInputElement).value);
  }

  protected setMovieFilter(event: Event): void {
    this.movieFilter.set((event.target as HTMLSelectElement).value);
  }

  protected setHallFilter(event: Event): void {
    this.hallFilter.set((event.target as HTMLSelectElement).value);
  }

  protected setDateFilter(event: Event): void {
    this.dateFilter.set((event.target as HTMLInputElement).value);
  }

  protected hasActiveFilters(): boolean {
    return (
      this.statusFilter() !== 'all' ||
      this.searchText().trim() !== '' ||
      this.movieFilter() !== '' ||
      this.hallFilter() !== '' ||
      this.dateFilter() !== ''
    );
  }

  protected clearFilters(): void {
    this.statusFilter.set('all');
    this.searchText.set('');
    this.movieFilter.set('');
    this.hallFilter.set('');
    this.dateFilter.set('');
  }

  protected openCreate(): void {
    this.formMode.set('create');
    this.editingShowtime.set(null);
    this.formError.set(null);
    this.formOpen.set(true);
  }

  protected openEdit(showtime: Showtime): void {
    this.movies.update((list) =>
      list.some((movie) => movie._id === showtime.movie._id) ? list : [...list, showtime.movie],
    );
    this.halls.update((list) =>
      list.some((hall) => hall._id === showtime.hall._id) ? list : [...list, showtime.hall],
    );
    this.formMode.set('edit');
    this.editingShowtime.set(showtime);
    this.formError.set(null);
    this.formOpen.set(true);
  }

  protected closeForm(): void {
    if (this.formSaving()) {
      return;
    }
    this.formOpen.set(false);
  }

  protected async onFormSubmit(submit: ShowtimeFormSubmit): Promise<void> {
    if (this.formSaving()) {
      return;
    }
    this.formSaving.set(true);
    this.formError.set(null);
    try {
      if (submit.mode === 'create') {
        await firstValueFrom(this.showtimeService.createShowtime(submit.data));
      } else {
        const editing = this.editingShowtime();
        if (!editing) {
          return;
        }
        await firstValueFrom(this.showtimeService.updateShowtime(editing._id, submit.data));
      }
      this.formOpen.set(false);
      await this.loadShowtimes(true);
    } catch (error) {
      this.formError.set(this.toErrorMessage(error));
    } finally {
      this.formSaving.set(false);
    }
  }

  protected confirmDelete(showtime: Showtime): void {
    this.deleteError.set(null);
    this.deleteTarget.set(showtime);
  }

  protected closeDelete(): void {
    if (this.deleteSaving()) {
      return;
    }
    this.deleteTarget.set(null);
  }

  protected async runDelete(): Promise<void> {
    const showtime = this.deleteTarget();
    if (!showtime || this.deleteSaving()) {
      return;
    }
    this.deleteSaving.set(true);
    this.deleteError.set(null);
    try {
      await firstValueFrom(this.showtimeService.deleteShowtime(showtime._id));
      this.deleteTarget.set(null);
      await this.loadShowtimes(true);
    } catch (error) {
      this.deleteError.set(this.toErrorMessage(error));
    } finally {
      this.deleteSaving.set(false);
    }
  }

  private groupKind(date: Date): ShowtimeGroup['kind'] {
    const today = this.localMidnight(new Date());
    if (date.getTime() === today.getTime()) {
      return 'today';
    }
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (date.getTime() === tomorrow.getTime()) {
      return 'tomorrow';
    }
    return 'date';
  }

  private groupCaption(kind: ShowtimeGroup['kind']): string {
    switch (kind) {
      case 'today':
        return 'Active Operations';
      case 'tomorrow':
        return 'Confirmed Schedule';
      case 'date':
        return 'Scheduled Screenings';
    }
  }

  private groupLabel(date: Date): string {
    const full = this.datePipe.transform(date, 'EEEE, MMMM d, y') ?? '';
    const plain = this.datePipe.transform(date, 'MMM d, y') ?? '';
    const weekday = this.datePipe.transform(date, 'EEE') ?? '';
    switch (this.groupKind(date)) {
      case 'today':
        return `TODAY • ${full}`;
      case 'tomorrow':
        return `TOMORROW • ${full}`;
      default:
        return `${weekday.toUpperCase()} • ${plain.toUpperCase()}`;
    }
  }

  private sortByDistanceFromToday(a: ShowtimeGroup, b: ShowtimeGroup): number {
    const todayStart = this.localMidnight(new Date()).getTime();
    const aMs = this.parseLocalKey(a.key).getTime() - todayStart;
    const bMs = this.parseLocalKey(b.key).getTime() - todayStart;
    return Math.abs(aMs) - Math.abs(bMs);
  }

  private localDateKey(date: Date): string {
    const pad = (value: number) => String(value).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  }

  private localMidnight(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  private parseLocalKey(key: string): Date {
    const parts = key.split('-').map(Number);
    return new Date(parts[0] ?? 0, (parts[1] ?? 1) - 1, parts[2] ?? 1);
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
