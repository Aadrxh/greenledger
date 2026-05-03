import { Injectable, inject } from '@angular/core';
import { 
  Firestore, 
  collection, 
  query, 
  where, 
  collectionData, 
  addDoc, 
  updateDoc, 
  doc, 
  deleteDoc, 
  orderBy,
  onSnapshot
} from '@angular/fire/firestore';
import { Expense } from '../models/expense.model';
import { Observable, from, of } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { CacheService } from './cache.service';
import { Auth } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root'
})
export class ExpenseService {
  private firestore = inject(Firestore);
  private cache = inject(CacheService);
  private auth = inject(Auth);

  // Helper to get the expenses collection reference
  private get expensesRef() {
    return collection(this.firestore, 'expenses');
  }

  /**
   * Fetches expenses, checking the local cache first.
   * If the cache is cold, we hit Firestore and then warm up the cache.
   */
  getExpenses(): Observable<Expense[]> {
    return from(this.cache.getExpenses()).pipe(
      switchMap(cached => {
        if (cached) {
          console.log('Serving expenses from local cache... zoom zoom! 🚀');
          return of(cached);
        }
        
        console.log('Cache miss. Fetching fresh data from Firestore... 📡');
        const q = query(
          this.expensesRef, 
          where('isDeleted', '==', false),
          orderBy('date', 'desc')
        );
        
        return collectionData(q, { idField: 'id' }).pipe(
          map(data => data as Expense[]),
          tap(expenses => this.cache.setExpenses(expenses))
        );
      })
    );
  }

  // Real-time listener version
  getExpensesRealtime() {
    const q = query(
      this.expensesRef, 
      where('isDeleted', '==', false),
      orderBy('date', 'desc')
    );
    
    return new Observable<Expense[]>(observer => {
      return onSnapshot(q, (snapshot) => {
        const expenses = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Expense));
        this.cache.setExpenses(expenses);
        observer.next(expenses);
      });
    });
  }

  async addExpense(expense: Omit<Expense, 'id'>) {
    const docRef = await addDoc(this.expensesRef, {
      ...expense,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isDeleted: false
    });
    await this.cache.clearCache();
    return docRef.id;
  }

  async updateExpense(id: string, expense: Partial<Expense>) {
    const docRef = doc(this.firestore, `expenses/${id}`);
    await updateDoc(docRef, {
      ...expense,
      updatedAt: new Date().toISOString()
    });
    await this.cache.clearCache();
  }

  async softDeleteExpense(id: string) {
    const docRef = doc(this.firestore, `expenses/${id}`);
    await updateDoc(docRef, {
      isDeleted: true,
      updatedAt: new Date().toISOString()
    });
    await this.cache.clearCache();
  }
}
