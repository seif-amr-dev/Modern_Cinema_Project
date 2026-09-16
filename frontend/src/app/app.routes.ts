import { Routes } from '@angular/router';
import { Auth } from './Feature/auth/auth';
import { VerifyEmail } from './Feature/verify-email/verify-email';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  { 
    path: '', 
    loadComponent: () => import('./Feature/home/home').then(m => m.Home) 
  },
  { 
    path: 'movie/:id', 
    loadComponent: () => import('./Feature/movie-details/movie-details').then(m => m.MovieDetails) 
  },
  { path: 'login', component: Auth },
  { path: 'verify-email', component: VerifyEmail },
  {
    path: 'admin',
    loadComponent: () => import('./shared/admin-layout/admin-layout').then(m => m.AdminLayout),
    canActivate: [adminGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./Feature/admin/dashboard/dashboard').then(m => m.Dashboard),
      },
      {
        path: 'users',
        data: { title: 'Users' },
        loadComponent: () => import('./Feature/admin/users/users').then(m => m.Users),
      },
      {
        path: 'movies',
        data: { title: 'Movies' },
        loadComponent: () => import('./Feature/admin/movies/movies').then(m => m.Movies),
      },
      {
        path: 'showtimes',
        data: { title: 'Showtimes' },
        loadComponent: () => import('./Feature/admin/showtimes/showtimes').then(m => m.Showtimes),
      },
      {
        path: 'halls',
        loadComponent: () =>
          import('./Feature/admin/halls/halls').then(m => m.Halls),
      },
    ],
  },
];