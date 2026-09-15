import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./Feature/home/home').then(m => m.Home)
  },
  {
    path: 'movie/:id',
    loadComponent: () =>
      import('./Feature/movie-details/movie-details').then(m => m.MovieDetails)
  },
  {
    path: '**',
    redirectTo: ''
  }
];
