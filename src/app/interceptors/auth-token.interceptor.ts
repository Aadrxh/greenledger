import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { from, switchMap } from 'rxjs';

export const authTokenInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(Auth);
  
  // Only add token if user is logged in
  return from(auth.currentUser?.getIdToken() || Promise.resolve(null)).pipe(
    switchMap(token => {
      if (token) {
        const authReq = req.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`
          }
        });
        return next(authReq);
      }
      return next(req);
    })
  );
};
