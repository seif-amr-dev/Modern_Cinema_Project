import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { catchError, map, Observable, of } from 'rxjs';
import { AuthService } from '../services/auth';

export const adminGuard: CanActivateFn = (): Observable<boolean | UrlTree> => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isLoggedIn()) {
    return of(router.createUrlTree(['/login']));
  }

  if (authService.isAdmin()) {
    return of(true);
  }

  return authService.getMe().pipe(
    map((response) => {
      authService.userRole.set(response.data.role);
      return authService.isAdmin() ? true : router.createUrlTree(['/']);
    }),
    catchError(() => {
      authService.logout();
      return of(router.createUrlTree(['/login']));
    }),
  );
};
