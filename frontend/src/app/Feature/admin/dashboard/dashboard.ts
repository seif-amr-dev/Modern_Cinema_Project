import { Component, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { HallService } from '../../../core/services/hall.service';
import { MovieService } from '../../../core/services/movie';
import { ShowtimeService } from '../../../core/services/showtime.service';
import { UserService } from '../../../core/services/user.service';

interface MetricState {
  loading: boolean;
  count: number | null;
  error: string | null;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  private movieService = inject(MovieService);
  private userService = inject(UserService);
  private hallService = inject(HallService);
  private showtimeService = inject(ShowtimeService);

  activeUsers = signal<MetricState>({ loading: true, count: null, error: null });
  movies = signal<MetricState>({ loading: true, count: null, error: null });
  halls = signal<MetricState>({ loading: true, count: null, error: null });
  showtimes = signal<MetricState>({ loading: true, count: null, error: null });

  constructor() {
    void this.loadMetric(
      this.activeUsers,
      () => firstValueFrom(this.userService.getUsers()).then((r) => r.count),
    );
    void this.loadMetric(
      this.movies,
      () => firstValueFrom(this.movieService.getMovies(undefined, undefined, undefined, 1, 1)).then((r) => r.count),
    );
    void this.loadMetric(
      this.halls,
      () => firstValueFrom(this.hallService.getHalls()).then((r) => r.count),
    );
    void this.loadMetric(
      this.showtimes,
      () =>
        firstValueFrom(this.showtimeService.getShowtimes()).then(
          (r) => r.results.filter((s) => s.isActive).length,
        ),
    );
  }

  private async loadMetric(
    metric: ReturnType<typeof signal<MetricState>>,
    request: () => Promise<number>,
  ): Promise<void> {
    try {
      const count = await request();
      metric.set({ loading: false, count, error: null });
    } catch (err) {
      metric.set({
        loading: false,
        count: null,
        error: this.toErrorMessage(err),
      });
    }
  }

  private toErrorMessage(err: unknown): string {
    if (err instanceof Error && err.message) {
      return err.message;
    }
    return 'Could not load metric.';
  }
}