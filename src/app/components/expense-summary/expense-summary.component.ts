import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { Store } from '@ngrx/store';
import { selectAllExpenses } from '../../store/expense/expense.selectors';
import { map, startWith, switchMap } from 'rxjs/operators';
import { combineLatest, of } from 'rxjs';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-expense-summary',
  standalone: true,
  imports: [
    CommonModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    ReactiveFormsModule
  ],
  template: `
    <div class="summary-container">
      <div class="header">
        <h1>Daily Summary</h1>
        <button mat-raised-button color="accent" (click)="exportToPDF()" [disabled]="!(summary$ | async)">
          <mat-icon>picture_as_pdf</mat-icon> Export PDF
        </button>
      </div>

      <mat-form-field appearance="outline">
        <mat-label>Select Date</mat-label>
        <input matInput [matDatepicker]="picker" [formControl]="dateControl">
        <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
        <mat-datepicker #picker></mat-datepicker>
      </mat-form-field>

      <div *ngIf="summary$ | async as summary; else noData" class="summary-cards">
        <mat-card class="stat-card total">
          <mat-card-header>
            <mat-card-title>Grand Total</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <h2>{{ summary.grandTotal | currency }}</h2>
          </mat-card-content>
        </mat-card>

        <div class="category-grid">
          <mat-card *ngFor="let cat of summary.categories | keyvalue">
            <mat-card-header>
              <mat-card-title>{{ cat.key }}</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <h3>{{ cat.value | currency }}</h3>
            </mat-card-content>
          </mat-card>
        </div>
      </div>

      <ng-template #noData>
        <mat-card class="no-data-card">
          <mat-card-content>
            <p>No expenses found for the selected date.</p>
          </mat-card-content>
        </mat-card>
      </ng-template>
    </div>
  `,
  styles: [`
    .summary-container {
      padding: 24px;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }
    .summary-cards {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }
    .category-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 16px;
    }
    .stat-card.total {
      background-color: #e8f5e9;
      text-align: center;
    }
    .no-data-card {
      text-align: center;
      padding: 48px;
      color: #666;
    }
  `]
})
export class ExpenseSummaryComponent implements OnInit {
  private store = inject(Store);
  
  dateControl = new FormControl(new Date());
  
  summary$ = combineLatest([
    this.store.select(selectAllExpenses),
    this.dateControl.valueChanges.pipe(startWith(this.dateControl.value))
  ]).pipe(
    map(([expenses, selectedDate]) => {
      if (!selectedDate) return null;
      
      const targetDate = selectedDate.toISOString().split('T')[0];
      const dailyExpenses = expenses.filter(e => e.date.startsWith(targetDate));
      
      if (dailyExpenses.length === 0) return null;
      
      const categories: Record<string, number> = {};
      let grandTotal = 0;
      
      dailyExpenses.forEach(e => {
        categories[e.category] = (categories[e.category] || 0) + e.amount;
        grandTotal += e.amount;
      });
      
      return { categories, grandTotal, date: targetDate, expenses: dailyExpenses };
    })
  );

  ngOnInit() {}

  async exportToPDF() {
    const summary = await new Promise<any>(resolve => {
      this.summary$.pipe(switchMap(s => of(s))).subscribe(resolve);
    });

    if (!summary) return;

    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text('GreenLedger Expense Summary', 14, 22);
    doc.setFontSize(12);
    doc.text(`Date: ${summary.date}`, 14, 32);
    doc.text(`Grand Total: $${summary.grandTotal.toFixed(2)}`, 14, 40);

    const tableData = summary.expenses.map((e: any) => [
      new Date(e.date).toLocaleDateString(),
      e.category,
      e.description,
      `$${e.amount.toFixed(2)}`,
      e.paymentMode
    ]);

    autoTable(doc, {
      startY: 50,
      head: [['Date', 'Category', 'Description', 'Amount', 'Payment Mode']],
      body: tableData,
    });

    doc.save(`GreenLedger_Summary_${summary.date}.pdf`);
  }
}
