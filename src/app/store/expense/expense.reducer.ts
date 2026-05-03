import { createReducer, on } from '@ngrx/store';
import { Expense } from '../../models/expense.model';
import * as ExpenseActions from './expense.actions';

export interface ExpenseState {
  expenses: Expense[];
  loading: boolean;
  error: string | null;
  filters: {
    search: string;
    category: string;
  };
}

export const initialState: ExpenseState = {
  expenses: [],
  loading: false,
  error: null,
  filters: {
    search: '',
    category: ''
  }
};

export const expenseReducer = createReducer(
  initialState,
  on(ExpenseActions.loadExpenses, (state) => ({ ...state, loading: true })),
  on(ExpenseActions.loadExpensesSuccess, (state, { expenses }) => ({ ...state, expenses, loading: false, error: null })),
  on(ExpenseActions.loadExpensesFailure, (state, { error }) => ({ ...state, loading: false, error })),
  
  on(ExpenseActions.addExpense, (state) => ({ ...state, loading: true })),
  on(ExpenseActions.addExpenseSuccess, (state, { expense }) => ({ ...state, expenses: [expense, ...state.expenses], loading: false })),
  
  on(ExpenseActions.updateExpenseSuccess, (state, { expense }) => ({
    ...state,
    expenses: state.expenses.map(e => e.id === expense.id ? expense : e)
  })),
  
  on(ExpenseActions.deleteExpenseSuccess, (state, { id }) => ({
    ...state,
    expenses: state.expenses.filter(e => e.id !== id)
  })),
  
  on(ExpenseActions.setFilter, (state, { search, category }) => ({
    ...state,
    filters: {
      search: search ?? state.filters.search,
      category: category ?? state.filters.category
    }
  })),
  
  on(ExpenseActions.setError, (state, { error }) => ({ ...state, error }))
);
