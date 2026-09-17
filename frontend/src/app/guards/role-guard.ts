import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../core/services/auth';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const payload = authService.getPayloadFromToken();
  if (!payload) {
    return router.createUrlTree(['/login']);
  }

  const requiredRole = route.data["role"];
  if (payload.role === requiredRole) {
    return true;
  } else {
    return router.createUrlTree(["/"]);
  }
};