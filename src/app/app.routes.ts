import { Routes, withRouterConfig } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { roleGuard } from './guards/role.guard';
import { LayoutComponent } from './components/layout/layout.component';
import { LoginComponent } from './components/auth/login/login.component';
import { SignupComponent } from './components/auth/signup/signup.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ExpenseTrackerComponent } from './components/expense-tracker/expense-tracker.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },

  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      { 
        path: 'dashboard', 
        component: DashboardComponent 
      },
      { 
        path: 'expenses', 
        component: ExpenseTrackerComponent,
        canActivate: [roleGuard]
      },
      { 
        path: 'summary', 
        loadComponent: () => import('./components/expense-summary/expense-summary.component')
          .then(m => m.ExpenseSummaryComponent),
        canActivate: [roleGuard]
      }
    ]
  },

  { path: '**', redirectTo: 'login' }
];
