import { Routes } from '@angular/router';
import { Auth } from './Feature/auth/auth';
import { AdminDashboard } from './Feature/admin/admin-dashboard';
import { adminGuard } from './core/guards/admin-guard';

export const routes: Routes = [
  { path: 'auth', component: Auth },
  {
    path: 'admin',
    component: AdminDashboard,
    // canActivate: [adminGuard],
  },
];
