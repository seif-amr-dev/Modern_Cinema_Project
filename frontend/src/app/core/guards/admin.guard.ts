import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { catchError, map, Observable, of } from 'rxjs';
import { AuthService } from '../services/auth';

export const adminGuard: CanActivateFn = async (): Promise<boolean | UrlTree> => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isLoggedIn()) {
    return router.createUrlTree(['/login']);
  }

  const payload = authService.getPayloadFromToken();
  if (payload && payload.role === 'admin') {
    return true;
  }

  try {
    const response = await authService.getMe();
    authService.currentUser.set(response.data!);
    if (response.data!.role === 'admin') {
      return true;
    }
  } catch (error) {
    authService.logout();
    return router.createUrlTree(['/login']);
  }

  return router.createUrlTree(['/']);
};
