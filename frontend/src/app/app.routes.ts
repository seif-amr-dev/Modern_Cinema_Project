import { Routes } from '@angular/router';
import { Auth } from './Feature/auth/auth';
import { VerifyEmail } from './Feature/verify-email/verify-email';

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
  { path: 'verify-email', component: VerifyEmail }
];
