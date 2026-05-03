import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, take } from 'rxjs/operators';

export const roleGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.user$.pipe(
    take(1),
    map(user => {
      if (user && (user.role === 'admin' || user.role === 'member')) {
        // Both roles can access expenses, but let's say only admin can see summary?
        // The instructions say: "canActivate: [authGuard, roleGuard]" for /expenses and /summary.
        // I'll allow both for now, but I can refine this.
        return true;
      }
      return router.parseUrl('/dashboard');
    })
  );
};
