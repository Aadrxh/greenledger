import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { Store } from '@ngrx/store';
import { selectTotalAmount, selectFilteredExpenses } from '../../store/expense/expense.selectors';
import { loadExpenses } from '../../store/expense/expense.actions';
import { ExpenseCategory } from '../../models/expense.model';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule],
  template: `
    <div class="dashboard-grid">
      <mat-card class="stat-card total">
        <mat-card-header>
          <mat-icon mat-card-avatar>payments</mat-icon>
          <mat-card-title>Total Expenses</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <h2 class="amount">{{ total$ | async | currency }}</h2>
        </mat-card-content>
      </mat-card>

      <mat-card class="stat-card" *ngFor="let cat of categories">
        <mat-card-header>
          <mat-icon mat-card-avatar>{{ getCategoryIcon(cat) }}</mat-icon>
          <mat-card-title>{{ cat }}</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <h2 class="amount">{{ getCategoryTotal(cat) | async | currency }}</h2>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .dashboard-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 24px;
    }
    .stat-card {
      padding: 16px;
    }
    .total {
      background-color: #e8f5e9;
    }
    .amount {
      font-size: 2rem;
      margin: 16px 0 0;
      color: #2e7d32;
    }
  `]
})
export class DashboardComponent {
  private store = inject(Store);
  
  total$ = this.store.select(selectTotalAmount);
  expenses$ = this.store.select(selectFilteredExpenses);
  
  categories = Object.values(ExpenseCategory);

  constructor() {
    // We moved dispatch to AuthService for better refresh handling
  }

  getCategoryTotal(category: ExpenseCategory) {
    return this.expenses$.pipe(
      map(expenses => expenses
        .filter(e => e.category === category)
        .reduce((sum, e) => sum + e.amount, 0)
      )
    );
  }

  getCategoryIcon(category: ExpenseCategory): string {
    switch (category) {
      case ExpenseCategory.FOOD: return 'restaurant';
      case ExpenseCategory.TRAVEL: return 'directions_car';
      case ExpenseCategory.OFFICE: return 'work';
      case ExpenseCategory.UTILITIES: return 'bolt';
      default: return 'category';
    }
  }
}
