import {
  Component,
  OnDestroy,
  OnInit,
  computed,
  inject,
  input,
  output,
} from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { Subscription } from 'rxjs';
import { Hall } from '../../../../core/models/hall.model';
import { Movie } from '../../../../core/models/movie.model';
import {
  CreateShowtimeRequest,
  Showtime,
  UpdateShowtimeRequest,
} from '../../../../core/models/showtime.model';

export type ShowtimeFormSubmit =
  | { mode: 'create'; data: CreateShowtimeRequest }
  | { mode: 'edit'; data: UpdateShowtimeRequest };

interface ShowtimeFormShape {
  movie: FormControl<string>;
  hall: FormControl<string>;
  start: FormControl<string>;
  end: FormControl<string>;
  price: FormControl<number>;
}

@Component({
  selector: 'app-showtime-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './showtime-form.html',
  styleUrl: './showtime-form.css',
})
export class ShowtimeForm implements OnInit, OnDestroy {
  private fb = inject(NonNullableFormBuilder);

  mode = input<'create' | 'edit'>('create');
  showtime = input<Showtime | null>(null);
  movies = input<Movie[]>([]);
  halls = input<Hall[]>([]);
  saving = input(false);
  serverError = input<string | null>(null);

  save = output<ShowtimeFormSubmit>();
  close = output<void>();

  private crossFieldValidator: ValidatorFn = (
    control: AbstractControl,
  ): ValidationErrors | null => {
    const group = control as FormGroup<ShowtimeFormShape>;
    const startRaw = group.controls.start.value;
    const endRaw = group.controls.end.value;
    if (!startRaw || !endRaw) {
      return null;
    }
    const start = new Date(startRaw).getTime();
    const end = new Date(endRaw).getTime();
    if (Number.isNaN(start) || Number.isNaN(end)) {
      return null;
    }
    if (end <= start) {
      return { endBeforeStart: true };
    }
    const movieId = group.controls.movie.value;
    if (!movieId) {
      return null;
    }
    const movie = this.movies().find((entry) => entry._id === movieId);
    if (!movie) {
      return null;
    }
    if (end - start < movie.duration * 60 * 1000) {
      return { durationTooShort: true };
    }
    return null;
  };

  protected form: FormGroup<ShowtimeFormShape> = this.fb.group(
    {
      movie: ['', [Validators.required]],
      hall: ['', [Validators.required]],
      start: ['', [Validators.required]],
      end: ['', [Validators.required]],
      price: [0, [Validators.required, Validators.min(0)]],
    },
    { validators: [this.crossFieldValidator] },
  );

  protected title = computed(() =>
    this.mode() === 'create'
      ? 'Add Showtime'
      : `Edit Showtime: ${this.movieTitle()}`,
  );

  protected movieTitle = computed(() => {
    const showtime = this.showtime();
    return showtime ? showtime.movie.title : '';
  });

  protected shortId(id: string): string {
    return id.length > 10 ? id.slice(0, 10) : id;
  }

  protected selectedMovie = computed(() => {
    const id = this.form.controls.movie.value;
    if (!id) {
      return null;
    }
    return this.movies().find((movie) => movie._id === id) ?? null;
  });

  protected selectedHall = computed(() => {
    const id = this.form.controls.hall.value;
    if (!id) {
      return null;
    }
    return this.halls().find((hall) => hall._id === id) ?? null;
  });

  protected scheduledDuration = computed<number | null>(() => {
    const start = this.form.controls.start.value;
    const end = this.form.controls.end.value;
    if (!start || !end) {
      return null;
    }
    const minutes =
      (new Date(end).getTime() - new Date(start).getTime()) / 60000;
    return Number.isFinite(minutes) && minutes > 0 ? Math.round(minutes) : null;
  });

  protected runtimeLabel = computed(() => {
    const movie = this.selectedMovie();
    if (!movie) {
      return 'No movie selected';
    }
    return `Runtime: ${movie.duration} min (${this.formatMinutes(movie.duration)})`;
  });

  protected durationSummary = computed(() => {
    const movie = this.selectedMovie();
    const minutes = this.scheduledDuration();
    if (!movie || minutes === null) {
      return 'Set a movie and time range to preview the schedule';
    }
    const diff = minutes - movie.duration;
    const buffer = diff > 0 ? `(+${this.formatMinutes(diff)} buffer)` : '';
    return `${this.formatMinutes(movie.duration)} · ${this.formatMinutes(minutes)} scheduled ${buffer}`.trim();
  });

  protected canAutoFill = computed(() => {
    const movie = this.selectedMovie();
    const start = this.form.controls.start.value;
    return !!movie && !!start;
  });

  protected movieOptionsMissing = computed(() => this.movies().length === 0);
  protected hallOptionsMissing = computed(() => this.halls().length === 0);

  private valueChangesSub = new Subscription();

  ngOnInit(): void {
    const showtime = this.showtime();
    if (this.mode() === 'edit' && showtime) {
      this.form.setValue({
        movie: showtime.movie._id,
        hall: showtime.hall._id,
        start: this.toLocalDatetimeValue(showtime.startTime),
        end: this.toLocalDatetimeValue(showtime.endTime),
        price: showtime.price,
      });
    }

    this.valueChangesSub = this.form
      .get('movie')!
      .valueChanges
      .subscribe(() => this.rerunCrossValidation());
    this.valueChangesSub.add(
      this.form.get('start')!.valueChanges.subscribe(() =>
        this.rerunCrossValidation(),
      ),
    );
    this.valueChangesSub.add(
      this.form.get('end')!.valueChanges.subscribe(() =>
        this.rerunCrossValidation(),
      ),
    );
  }

  ngOnDestroy(): void {
    this.valueChangesSub.unsubscribe();
  }

  protected autoFillEnd(): void {
    const movie = this.selectedMovie();
    const startRaw = this.form.controls.start.value;
    if (!movie || !startRaw) {
      return;
    }
    const start = new Date(startRaw);
    if (!Number.isNaN(start.getTime())) {
      const end = new Date(start.getTime() + movie.duration * 60 * 1000);
      this.form.controls.end.setValue(this.toLocalDatetimeValue(end));
    }
  }

  protected onSubmit(): void {
    if (this.saving()) {
      return;
    }
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const values = this.form.getRawValue();
    const data: CreateShowtimeRequest = {
      movie: values.movie,
      hall: values.hall,
      startTime: this.toIsoString(values.start),
      endTime: this.toIsoString(values.end),
      price: values.price,
    };

    if (this.mode() === 'create') {
      this.save.emit({ mode: 'create', data });
    } else {
      this.save.emit({ mode: 'edit', data: data as UpdateShowtimeRequest });
    }
  }

  protected hasError(controlName: string, validator: string): boolean {
    const control = this.form.get(controlName);
    return (
      !!control &&
      control.touched &&
      control.invalid &&
      !!control.errors?.[validator]
    );
  }

  protected validationMessage(controlName: string, validator: string): string {
    if (validator === 'required') {
      return 'This field is required.';
    }
    if (validator === 'min') {
      const control = this.form.get(controlName);
      const min = control?.errors?.['min'] as { min?: number } | null;
      return min?.min !== undefined
        ? `Must be ${min.min} or higher.`
        : 'Value is too low.';
    }
    return 'Enter a valid value.';
  }

  protected hasGroupError(key: string): boolean {
    const errors = this.form.errors;
    return this.form.touched && !!errors?.[key];
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

  protected onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.close.emit();
    }
  }

  protected onEscape(): void {
    if (this.saving()) {
      return;
    }
    this.close.emit();
  }

  protected onCancel(): void {
    if (this.saving()) {
      return;
    }
    this.close.emit();
  }

  private rerunCrossValidation(): void {
    this.form.updateValueAndValidity();
  }

  private toLocalDatetimeValue(isoOrDate: string | Date): string {
    const date = typeof isoOrDate === 'string' ? new Date(isoOrDate) : isoOrDate;
    if (Number.isNaN(date.getTime())) {
      return '';
    }
    const pad = (value: number) => String(value).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
      date.getDate(),
    )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }

  private toIsoString(localValue: string): string {
    if (!localValue) {
      return '';
    }
    const date = new Date(localValue);
    return Number.isNaN(date.getTime()) ? '' : date.toISOString();
  }
}