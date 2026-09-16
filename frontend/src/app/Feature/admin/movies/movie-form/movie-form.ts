import {
  Component,
  OnDestroy,
  OnInit,
  computed,
  inject,
  input,
  output,
  signal,
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
import {
  AgeRating,
  CreateMoviePayload,
  Movie,
  MovieFormValue,
  MovieStatus,
  UpdateMoviePayload,
} from '../../../../core/models/movie.model';

export type MovieFormSubmit =
  | { mode: 'create'; data: CreateMoviePayload }
  | { mode: 'edit'; data: UpdateMoviePayload };

const MAX_POSTER_BYTES = 5 * 1024 * 1024;

function listValidator(minItems: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const raw = typeof control.value === 'string' ? control.value : '';
    const parts = raw
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
    return parts.length >= minItems ? null : { required: true };
  };
}

function optionalUrlValidator(control: AbstractControl): ValidationErrors | null {
  const value = (typeof control.value === 'string' ? control.value : '').trim();
  if (!value) {
    return null;
  }
  return /^https?:\/\/.+/i.test(value) ? null : { url: true };
}

interface MovieFormShape {
  title: FormControl<string>;
  description: FormControl<string>;
  genres: FormControl<string>;
  duration: FormControl<number>;
  ageRating: FormControl<string>;
  score: FormControl<number>;
  releaseDate: FormControl<string>;
  status: FormControl<string>;
  director: FormControl<string>;
  cast: FormControl<string>;
  trailerUrl: FormControl<string>;
}

@Component({
  selector: 'app-movie-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './movie-form.html',
  styleUrl: './movie-form.css',
})
export class MovieForm implements OnInit, OnDestroy {
  private fb = inject(NonNullableFormBuilder);

  mode = input<'create' | 'edit'>('create');
  movie = input<Movie | null>(null);
  saving = input(false);
  serverError = input<string | null>(null);

  save = output<MovieFormSubmit>();
  close = output<void>();

  protected title = computed(() =>
    this.mode() === 'create'
      ? 'Add New Movie'
      : `Edit Movie: ${this.movie()?.title ?? ''}`,
  );

  protected subtitle = computed(() =>
    this.mode() === 'create'
      ? 'Ingest a feature into the active catalog'
      : 'Update feature metadata and master assets',
  );

  protected ageRatings: { value: AgeRating; label: string }[] = [
    { value: 'G', label: 'G (General Audience)' },
    { value: 'PG', label: 'PG (Parental Guidance)' },
    { value: 'PG-13', label: 'PG-13 (Parents Strongly Cautioned)' },
    { value: 'R', label: 'R (Restricted)' },
    { value: 'NC-17', label: 'NC-17 (Adults Only)' },
  ];

  protected statuses: { value: MovieStatus; label: string }[] = [
    { value: 'now_showing', label: 'Now Showing (Active)' },
    { value: 'coming_soon', label: 'Coming Soon (Presales Open)' },
    { value: 'ended', label: 'Ended (Archived)' },
  ];

  protected posterFile = signal<File | null>(null);
  protected posterPreview = signal<string | null>(null);
  protected posterError = signal<string | null>(null);

  protected posterName = computed(() => {
    const file = this.posterFile();
    if (file) {
      return file.name;
    }
    return this.mode() === 'edit' && this.movie()
      ? 'Existing poster kept — choose a file to replace it'
      : 'No poster selected';
  });

  protected hasPosterPreview = computed(
    () => this.posterPreview() !== null,
  );

  protected form: FormGroup<MovieFormShape> = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(150)]],
    description: ['', [Validators.required, Validators.maxLength(2000)]],
    genres: ['', [Validators.required, listValidator(1)]],
    duration: [90, [Validators.required, Validators.min(90)]],
    ageRating: ['', [Validators.required]],
    score: [5, [Validators.required, Validators.min(0), Validators.max(10)]],
    releaseDate: ['', [Validators.required]],
    status: ['', [Validators.required]],
    director: ['', []],
    cast: ['', []],
    trailerUrl: ['', [optionalUrlValidator]],
  });

  private objectUrl: string | null = null;

  ngOnInit(): void {
    const movie = this.movie();
    if (this.mode() === 'edit' && movie) {
      this.form.setValue({
        title: movie.title,
        description: movie.description,
        genres: movie.genre.join(', '),
        duration: movie.duration,
        ageRating: movie.ageRating,
        score: movie.score ?? 0,
        releaseDate: this.toDateInputValue(movie.releaseDate),
        status: movie.status,
        director: movie.director ?? '',
        cast: movie.cast.join(', '),
        trailerUrl: movie.trailerUrl ?? '',
      });
      this.posterPreview.set(movie.poster.url);
    }
  }

  ngOnDestroy(): void {
    if (this.objectUrl) {
      URL.revokeObjectURL(this.objectUrl);
      this.objectUrl = null;
    }
  }

  protected onPosterSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.item(0) ?? null;
    this.posterError.set(null);

    if (file) {
      if (!file.type.startsWith('image/')) {
        this.posterError.set('Only image files are allowed.');
        input.value = '';
        return;
      }
      if (file.size > MAX_POSTER_BYTES) {
        this.posterError.set('Poster must be 5MB or smaller.');
        input.value = '';
        return;
      }
    }

    this.posterFile.set(file);

    if (file) {
      if (this.objectUrl) {
        URL.revokeObjectURL(this.objectUrl);
      }
      this.objectUrl = URL.createObjectURL(file);
      this.posterPreview.set(this.objectUrl);
    } else {
      this.posterPreview.set(this.movie()?.poster.url ?? null);
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

    if (this.mode() === 'create' && !this.posterFile()) {
      this.posterError.set('A poster image is required.');
      return;
    }

    const values = this.form.getRawValue();

    const base: MovieFormValue = {
      title: values.title.trim(),
      description: values.description.trim(),
      genres: this.splitList(values.genres),
      duration: values.duration,
      ageRating: values.ageRating as AgeRating,
      score: values.score,
      releaseDate: values.releaseDate,
      status: values.status as MovieStatus,
      director: this.blankToUndefined(values.director),
      cast: this.splitList(values.cast),
      trailerUrl: this.blankToUndefined(values.trailerUrl),
    };

    if (this.mode() === 'create') {
      const poster = this.posterFile();
      if (!poster) {
        return;
      }
      this.save.emit({ mode: 'create', data: { ...base, poster } });
      return;
    }

    const poster = this.posterFile() ?? undefined;
    const data: UpdateMoviePayload = { ...base, poster };
    this.save.emit({ mode: 'edit', data });
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

  protected validationMessage(
    controlName: string,
    validator: string,
  ): string {
    if (validator === 'required') {
      return 'This field is required.';
    }
    if (validator === 'min') {
      const control = this.form.get(controlName);
      const min = control?.errors?.['min'] as { min?: number } | null;
      return min?.min !== undefined
        ? `Must be at least ${min.min}.`
        : 'Value is too low.';
    }
    if (validator === 'max') {
      const control = this.form.get(controlName);
      const max = control?.errors?.['max'] as { max?: number } | null;
      return max?.max !== undefined
        ? `Must be ${max.max} or lower.`
        : 'Value is too high.';
    }
    if (validator === 'maxlength') {
      const control = this.form.get(controlName);
      const required = control?.errors?.['maxlength'] as
        | { requiredLength?: number }
        | null;
      return required?.requiredLength
        ? `Must be ${required.requiredLength} characters or fewer.`
        : 'Value is too long.';
    }
    if (validator === 'url') {
      return 'Enter a valid http(s) URL.';
    }
    return 'Enter a valid value.';
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

  private splitList(value: string): string[] {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }

  private blankToUndefined(value: string): string | undefined {
    const trimmed = value.trim();
    return trimmed ? trimmed : undefined;
  }

  private toDateInputValue(value: string): string {
    if (!value) {
      return '';
    }
    const date = value.slice(0, 10);
    return /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : '';
  }
}