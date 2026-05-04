import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withRouterConfig } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideNativeDateAdapter } from '@angular/material/core';

import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getAuth, provideAuth } from '@angular/fire/auth';

import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';

import { routes } from './app.routes';
import { environment } from '../environments/environment';
import { authTokenInterceptor } from './interceptors/auth-token.interceptor';

import { expenseReducer } from './store/expense/expense.reducer';
import { ExpenseEffects } from './store/expense/expense.effects';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withRouterConfig({ onSameUrlNavigation: 'reload' })),
    provideAnimationsAsync(),
    provideNativeDateAdapter(),
    provideHttpClient(withInterceptors([authTokenInterceptor])),
    
    // Firebase
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideFirestore(() => {
      const app = initializeApp(environment.firebase);
      return getFirestore(app);
    }),
    provideAuth(() => {
      const app = initializeApp(environment.firebase);
      return getAuth(app);
    }),

    // NgRx
    provideStore({ expenses: expenseReducer }), 
    provideEffects([ExpenseEffects]),
    provideStoreDevtools({ maxAge: 25, logOnly: environment.production })
  ]
};
