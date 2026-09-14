import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MovieService, Movie } from '../../core/services/movie';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css',
})
export class AdminDashboard implements OnInit {
  private fb = inject(FormBuilder);
  private movieService = inject(MovieService);

  selectedFile: File | null = null;
  isSubmitting = false;
  successMessage = '';
  errorMessage = '';

  movies: Movie[] = [];
  isLoadingMovies = false;
  loadError = '';

  editingMovieId: string | null = null;

  movieForm = this.fb.group({
    title: ['', Validators.required],
    description: ['', Validators.required],
    duration: ['', Validators.required],
    ageRating: ['', Validators.required],
    releaseDate: ['', Validators.required],
    status: ['now-showing', Validators.required],
    director: [''],
    genre: [''],
    cast: [''],
    trailerUrl: [''],
  });

  ngOnInit() {
    this.loadMovies();
  }

  loadMovies() {
    this.isLoadingMovies = true;
    this.loadError = '';

    this.movieService.getAllMovies().subscribe({
      next: (response) => {
        this.movies = response.results;
        this.isLoadingMovies = false;
      },
      error: (error) => {
        console.error('Failed to load movies', error);
        this.loadError = 'Could not load movies';
        this.isLoadingMovies = false;
      },
    });
  }

  hasDateValue(): boolean {
    return !!this.movieForm.get('releaseDate')?.value;
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }

  startEdit(movie: Movie) {
    this.editingMovieId = movie._id;
    this.successMessage = '';
    this.errorMessage = '';

    this.movieForm.patchValue({
      title: movie.title,
      description: movie.description,
      duration: movie.duration?.toString(),
      ageRating: movie.ageRating,
      releaseDate: movie.releaseDate ? movie.releaseDate.substring(0, 10) : '',
      status: movie.status,
      director: movie.director || '',
      genre: movie.genre ? movie.genre.join(', ') : '',
      cast: movie.cast ? movie.cast.join(', ') : '',
      trailerUrl: movie.trailerUrl || '',
    });

    this.selectedFile = null;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancelEdit() {
    this.editingMovieId = null;
    this.movieForm.reset({ status: 'now-showing' });
    this.selectedFile = null;
  }

  deleteMovie(movie: Movie) {
    const confirmed = confirm(`Delete "${movie.title}"? This cannot be undone.`);
    if (!confirmed) return;

    this.movieService.deleteMovie(movie._id).subscribe({
      next: () => {
        this.loadMovies();
      },
      error: (error) => {
        console.error('Failed to delete movie', error);
        this.errorMessage = 'Failed to delete movie';
      },
    });
  }

  private buildFormData(): FormData {
    const formValue = this.movieForm.value;
    const formData = new FormData();

    formData.append('title', formValue.title || '');
    formData.append('description', formValue.description || '');
    formData.append('duration', formValue.duration || '');
    formData.append('ageRating', formValue.ageRating || '');
    formData.append('releaseDate', formValue.releaseDate || '');
    formData.append('status', formValue.status || '');
    formData.append('director', formValue.director || '');
    formData.append('trailerUrl', formValue.trailerUrl || '');

    const genreArray = formValue.genre ? formValue.genre.split(',').map((g) => g.trim()) : [];
    const castArray = formValue.cast ? formValue.cast.split(',').map((c) => c.trim()) : [];
    formData.append('genre', JSON.stringify(genreArray));
    formData.append('cast', JSON.stringify(castArray));

    if (this.selectedFile) {
      formData.append('poster', this.selectedFile);
    }

    return formData;
  }

  onSubmit() {
    this.successMessage = '';
    this.errorMessage = '';

    if (this.movieForm.invalid) {
      this.errorMessage = 'Please fill all required fields';
      return;
    }

    if (!this.editingMovieId && !this.selectedFile) {
      this.errorMessage = 'Please select a poster image';
      return;
    }

    const formData = this.buildFormData();
    this.isSubmitting = true;

    if (this.editingMovieId) {
      this.movieService.updateMovie(this.editingMovieId, formData).subscribe({
        next: (response) => {
          console.log('Movie updated successfully', response);
          this.successMessage = 'Movie updated successfully!';
          this.isSubmitting = false;
          this.cancelEdit();
          this.loadMovies();
        },
        error: (error) => {
          console.error('Failed to update movie', error);
          this.errorMessage = 'An error occurred while updating the movie';
          this.isSubmitting = false;
        },
      });
    } else {
      this.movieService.createMovie(formData).subscribe({
        next: (response) => {
          console.log('Movie created successfully', response);
          this.successMessage = 'Movie added successfully!';
          this.isSubmitting = false;
          this.movieForm.reset({ status: 'now-showing' });
          this.selectedFile = null;
          this.loadMovies();
        },
        error: (error) => {
          console.error('Failed to create movie', error);
          this.errorMessage = 'An error occurred while adding the movie';
          this.isSubmitting = false;
        },
      });
    }
  }
}
