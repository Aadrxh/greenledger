import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ExpenseState } from './expense.reducer';

export const selectExpenseState = createFeatureSelector<ExpenseState>('expenses');

export const selectAllExpenses = createSelector(
  selectExpenseState,
  (state) => state.expenses
);

export const selectExpenseLoading = createSelector(
  selectExpenseState,
  (state) => state.loading
);

export const selectExpenseError = createSelector(
  selectExpenseState,
  (state) => state.error
);

export const selectFilters = createSelector(
  selectExpenseState,
  (state) => state.filters
);

export const selectFilteredExpenses = createSelector(
  selectAllExpenses,
  selectFilters,
  (expenses, filters) => {
    return expenses.filter(e => {
      const matchesSearch = e.description.toLowerCase().includes(filters.search.toLowerCase());
      const matchesCategory = filters.category ? e.category === filters.category : true;
      return matchesSearch && matchesCategory;
    });
  }
);

export const selectTotalAmount = createSelector(
  selectFilteredExpenses,
  (expenses) => expenses.reduce((total, e) => total + e.amount, 0)
);
