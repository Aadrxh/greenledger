import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { selectFilteredExpenses, selectExpenseLoading } from '../../store/expense/expense.selectors';
import { loadExpenses, setFilter, deleteExpense } from '../../store/expense/expense.actions';
import { ExpenseCategory, Expense } from '../../models/expense.model';
import { ExpenseFormDialogComponent } from '../expense-form-dialog/expense-form-dialog.component';
import { ConfirmDialogComponent } from '../shared/confirm-dialog/confirm-dialog.component';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-expense-tracker',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule
  ],
  template: `
    <div class="tracker-container">
      <div class="actions-row">
        <mat-form-field appearance="outline">
          <mat-label>Search Description</mat-label>
          <input matInput (input)="onSearch($event)" placeholder="Search..." data-test-id="search-input">
          <mat-icon matSuffix>search</mat-icon>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Category</mat-label>
          <mat-select (selectionChange)="onCategoryFilter($event.value)" data-test-id="category-filter">
            <mat-option value="">All Categories</mat-option>
            <mat-option *ngFor="let cat of categories" [value]="cat">{{ cat }}</mat-option>
          </mat-select>
        </mat-form-field>

        <span class="spacer"></span>

        <button mat-raised-button color="primary" (click)="openExpenseForm()" data-test-id="add-expense-btn">
          <mat-icon>add</mat-icon> Add Expense
        </button>
      </div>

      <div class="table-container mat-elevation-z8">
        <table mat-table [dataSource]="(expenses$ | async) || []" matSort data-test-id="expense-table">
          <ng-container matColumnDef="date">
            <th mat-header-cell *matHeaderCellDef mat-sort-header> Date </th>
            <td mat-cell *matCellDef="let element"> {{ element.date | date }} </td>
          </ng-container>

          <ng-container matColumnDef="category">
            <th mat-header-cell *matHeaderCellDef mat-sort-header> Category </th>
            <td mat-cell *matCellDef="let element"> {{ element.category }} </td>
          </ng-container>

          <ng-container matColumnDef="description">
            <th mat-header-cell *matHeaderCellDef mat-sort-header> Description </th>
            <td mat-cell *matCellDef="let element"> {{ element.description }} </td>
          </ng-container>

          <ng-container matColumnDef="amount">
            <th mat-header-cell *matHeaderCellDef mat-sort-header> Amount </th>
            <td mat-cell *matCellDef="let element"> {{ element.amount | currency }} </td>
          </ng-container>

          <ng-container matColumnDef="paymentMode">
            <th mat-header-cell *matHeaderCellDef mat-sort-header> Payment Mode </th>
            <td mat-cell *matCellDef="let element"> {{ element.paymentMode }} </td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef> Actions </th>
            <td mat-cell *matCellDef="let element">
              <button mat-icon-button color="primary" (click)="openExpenseForm(element)" data-test-id="edit-btn">
                <mat-icon>edit</mat-icon>
              </button>
              <button mat-icon-button color="warn" (click)="onDelete(element)" *ngIf="isAdmin" data-test-id="delete-btn">
                <mat-icon>delete</mat-icon>
              </button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>

        <mat-paginator [pageSizeOptions]="[5, 10, 25, 100]" aria-label="Select page of expenses"></mat-paginator>
      </div>
    </div>
  `,
  styles: [`
    .tracker-container {
      padding: 16px;
    }
    .actions-row {
      display: flex;
      gap: 16px;
      align-items: center;
      margin-bottom: 24px;
      flex-wrap: wrap;
    }
    .spacer {
      flex: 1 1 auto;
    }
    .table-container {
      overflow-x: auto;
    }
    table {
      width: 100%;
    }
  `]
})
export class ExpenseTrackerComponent implements OnInit {
  private store = inject(Store);
  private dialog = inject(MatDialog);
  private authService = inject(AuthService);

  expenses$ = this.store.select(selectFilteredExpenses);
  loading$ = this.store.select(selectExpenseLoading);
  
  categories = Object.values(ExpenseCategory);
  displayedColumns: string[] = ['date', 'category', 'description', 'amount', 'paymentMode', 'actions'];
  
  /**
   * We use a Subject to debounce the search input.
   * This prevents us from hammering the CPU/Network with every keystroke.
   * We wait 300ms for the user to finish typing.
   */
  private searchSubject = new Subject<string>();
  isAdmin = false;

  ngOnInit() {
    // Kick off the loading process as soon as the component wakes up
    this.store.dispatch(loadExpenses());
    
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(search => {
      // Once the user stops typing, we update the filters in the NgRx state
      this.store.dispatch(setFilter({ search }));
    });

    this.authService.user$.subscribe(user => {
      this.isAdmin = user?.role === 'admin';
    });
  }

  onSearch(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.searchSubject.next(value);
  }

  onCategoryFilter(category: string) {
    this.store.dispatch(setFilter({ category }));
  }

  openExpenseForm(expense?: Expense) {
    this.dialog.open(ExpenseFormDialogComponent, {
      width: '500px',
      data: expense
    });
  }

  onDelete(expense: Expense) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete Expense',
        message: 'Are you sure you want to delete this expense? This action is irreversible.'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.store.dispatch(deleteExpense({ id: expense.id }));
      }
    });
  }
}
