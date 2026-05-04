import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard = async () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (await authService.isLoggedIn()) {
    return true;
  }

  return router.parseUrl('/login');
};
