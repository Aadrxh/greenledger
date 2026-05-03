import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { ExpenseService } from '../../services/expense.service';
import * as ExpenseActions from './expense.actions';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { ToastService } from '../../services/toast.service'; // Will create this later

@Injectable()
export class ExpenseEffects {
  private actions$ = inject(Actions);
  private expenseService = inject(ExpenseService);
  private toastService = inject(ToastService);

  /**
   * This effect listens for the 'loadExpenses' action.
   * It's like a background worker that fetches data from Firebase
   * so the UI stays snappy and responsive.
   */
  loadExpenses$ = createEffect(() => this.actions$.pipe(
    ofType(ExpenseActions.loadExpenses),
    switchMap(() => this.expenseService.getExpenses().pipe(
      map(expenses => ExpenseActions.loadExpensesSuccess({ expenses })),
      catchError(error => {
        // If something goes wrong, we show a friendly toast to the user
        this.toastService.error('Oops! We couldn\'t load your expenses.');
        return of(ExpenseActions.loadExpensesFailure({ error: error.message }));
      })
    ))
  ));

  /**
   * When a user adds an expense, we save it to Firebase and then
   * tell the rest of the app "Hey, we have a new one!"
   */
  addExpense$ = createEffect(() => this.actions$.pipe(
    ofType(ExpenseActions.addExpense),
    switchMap(({ expense }) => from(this.expenseService.addExpense(expense)).pipe(
      map(id => {
        this.toastService.success('Nice! Expense added to your ledger. 🌿');
        return ExpenseActions.addExpenseSuccess({ expense: { ...expense, id } as any });
      }),
      catchError(error => {
        this.toastService.error('Failed to add expense. Please try again.');
        return of(ExpenseActions.addExpenseFailure({ error: error.message }));
      })
    ))
  ));

  updateExpense$ = createEffect(() => this.actions$.pipe(
    ofType(ExpenseActions.updateExpense),
    switchMap(({ id, expense }) => from(this.expenseService.updateExpense(id, expense)).pipe(
      map(() => {
        this.toastService.success('Expense updated successfully');
        return ExpenseActions.updateExpenseSuccess({ expense: { ...expense, id } as any });
      }),
      catchError(error => {
        this.toastService.error('Failed to update expense');
        return of(ExpenseActions.updateExpenseFailure({ error: error.message }));
      })
    ))
  ));

  deleteExpense$ = createEffect(() => this.actions$.pipe(
    ofType(ExpenseActions.deleteExpense),
    switchMap(({ id }) => from(this.expenseService.softDeleteExpense(id)).pipe(
      map(() => {
        this.toastService.success('Expense deleted successfully');
        return ExpenseActions.deleteExpenseSuccess({ id });
      }),
      catchError(error => {
        this.toastService.error('Failed to delete expense');
        return of(ExpenseActions.deleteExpenseFailure({ error: error.message }));
      })
    ))
  ));
}

// Helper for 'from' which was missing
import { from } from 'rxjs';
