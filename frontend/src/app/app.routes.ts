import { Routes } from '@angular/router';
import { Auth } from './Feature/auth/auth';
import { VerifyEmail } from './Feature/verify-email/verify-email';

export const routes: Routes = [
  { path: 'login', component: Auth },
  { path: 'verify-email', component: VerifyEmail },
  { path: '', redirectTo: '/login', pathMatch: 'full' }
];
