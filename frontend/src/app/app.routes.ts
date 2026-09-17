import { Routes } from '@angular/router';
import { Auth } from './Feature/auth/auth';
import { VerifyEmail } from './Feature/verify-email/verify-email';
import { authGuard } from './guards/auth-guard';
import { guestGuard } from './guards/guest-guard';
import { BookingPage } from './Feature/booking/pages/booking-page/booking-page';
import { Profile } from './user profile/profile/profile';

export const routes: Routes = [
  { 
    path: '', 
    loadComponent: () => import('./Feature/home/home').then(m => m.Home) 
  },
  { 
    path: 'movie/:id', 
    loadComponent: () => import('./Feature/movie-details/movie-details').then(m => m.MovieDetails) 
  },
  { 
    path: 'book/:showId', 
    component:BookingPage,
    canActivate: [authGuard] 
  },
  { 
    path: 'login', 
    component: Auth,
    canActivate: [guestGuard]
  },
  { 
    path: 'verify-email', 
    component: VerifyEmail,
    canActivate: [guestGuard]
  },
  { 
    path: 'forget-password', 
    loadComponent: () => import('./Feature/auth/forget-password/forget-password').then(m => m.ForgetPassword),
    canActivate: [guestGuard]
  },
  { 
    path: 'reset-password/:token', 
    loadComponent: () => import('./Feature/auth/reset-password/reset-password').then(m => m.ResetPassword),
    canActivate: [guestGuard]
  },
  { 
  path: 'profile', 
  component:Profile,
  canActivate: [authGuard] 
  },
  {
    path: 'my-tickets',
    loadComponent: () => import('./Feature/booking/pages/my-tickets/my-tickets').then(m => m.MyTickets),
    canActivate: [authGuard]
  }
];