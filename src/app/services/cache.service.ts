import { Injectable } from '@angular/core';
import Dexie, { Table } from 'dexie';
import { Expense } from '../models/expense.model';

export interface CachedData<T> {
  id: string;
  data: T;
  timestamp: number;
}

@Injectable({
  providedIn: 'root'
})
export class CacheService extends Dexie {
  expenses!: Table<CachedData<Expense[]>, string>;
  private readonly TTL = 5 * 60 * 1000; // 5 minutes

  constructor() {
    super('GreenLedgerDB');
    this.version(1).stores({
      expenses: 'id, timestamp'
    });
  }

  async setExpenses(expenses: Expense[]) {
    await this.expenses.put({
      id: 'all_expenses',
      data: expenses,
      timestamp: Date.now()
    });
  }

  async getExpenses(): Promise<Expense[] | null> {
    const cached = await this.expenses.get('all_expenses');
    if (!cached) return null;

    if (Date.now() - cached.timestamp > this.TTL) {
      await this.expenses.delete('all_expenses');
      return null;
    }

    return cached.data;
  }

  async clearCache() {
    await this.expenses.clear();
  }
}
