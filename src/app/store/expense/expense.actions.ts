import { createAction, props } from '@ngrx/store';
import { Expense } from '../../models/expense.model';

// Load Expenses
export const loadExpenses = createAction('[Expense] Load Expenses');
export const loadExpensesSuccess = createAction('[Expense] Load Expenses Success', props<{ expenses: Expense[] }>());
export const loadExpensesFailure = createAction('[Expense] Load Expenses Failure', props<{ error: any }>());

// Add Expense
export const addExpense = createAction('[Expense] Add Expense', props<{ expense: Omit<Expense, 'id'> }>());
export const addExpenseSuccess = createAction('[Expense] Add Expense Success', props<{ expense: Expense }>());
export const addExpenseFailure = createAction('[Expense] Add Expense Failure', props<{ error: any }>());

// Update Expense
export const updateExpense = createAction('[Expense] Update Expense', props<{ id: string, expense: Partial<Expense> }>());
export const updateExpenseSuccess = createAction('[Expense] Update Expense Success', props<{ expense: Expense }>());
export const updateExpenseFailure = createAction('[Expense] Update Expense Failure', props<{ error: any }>());

// Delete Expense
export const deleteExpense = createAction('[Expense] Delete Expense', props<{ id: string }>());
export const deleteExpenseSuccess = createAction('[Expense] Delete Expense Success', props<{ id: string }>());
export const deleteExpenseFailure = createAction('[Expense] Delete Expense Failure', props<{ error: any }>());

// Filters
export const setFilter = createAction('[Expense] Set Filter', props<{ search?: string, category?: string }>());
export const setError = createAction('[Expense] Set Error', props<{ error: string | null }>());
