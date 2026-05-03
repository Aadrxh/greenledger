import { Component, inject, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { MatRadioModule } from '@angular/material/radio';
import { Store } from '@ngrx/store';
import { Expense, ExpenseCategory, PaymentMode } from '../../models/expense.model';
import { addExpense, updateExpense } from '../../store/expense/expense.actions';
import { AuthService } from '../../services/auth.service';
import { take } from 'rxjs';

@Component({
  selector: 'app-expense-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatButtonModule,
    MatRadioModule
  ],
  template: `
    <h2 mat-dialog-title>{{ data ? 'Edit Expense' : 'Add Expense' }}</h2>
    <mat-dialog-content>
      <form [formGroup]="expenseForm" class="expense-form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Amount</mat-label>
          <input matInput type="number" formControlName="amount" placeholder="0.00">
          <mat-error *ngIf="expenseForm.get('amount')?.hasError('required')">Amount is required</mat-error>
          <mat-error *ngIf="expenseForm.get('amount')?.hasError('min')">Amount must be >= 1</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Category</mat-label>
          <mat-select formControlName="category">
            <mat-option *ngFor="let cat of categories" [value]="cat">{{ cat }}</mat-option>
          </mat-select>
          <mat-error *ngIf="expenseForm.get('category')?.hasError('required')">Category is required</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Description</mat-label>
          <textarea matInput formControlName="description" maxlength="200" placeholder="What was this for?"></textarea>
          <mat-hint align="end">{{expenseForm.get('description')?.value?.length || 0}}/200</mat-hint>
          <mat-error *ngIf="expenseForm.get('description')?.hasError('required')">Description is required</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Date</mat-label>
          <input matInput [matDatepicker]="picker" formControlName="date" [max]="maxDate">
          <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
          <mat-datepicker #picker></mat-datepicker>
          <mat-error *ngIf="expenseForm.get('date')?.hasError('required')">Date is required</mat-error>
        </mat-form-field>

        <div class="radio-group">
          <label>Payment Mode:</label>
          <mat-radio-group formControlName="paymentMode">
            <mat-radio-button *ngFor="let mode of paymentModes" [value]="mode">
              {{ mode }}
            </mat-radio-button>
          </mat-radio-group>
        </div>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancel</button>
      <button mat-raised-button color="primary" [disabled]="expenseForm.invalid" (click)="onSubmit()">
        {{ data ? 'Update' : 'Save' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .expense-form {
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding-top: 8px;
    }
    .full-width {
      width: 100%;
    }
    .radio-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin: 8px 0;
    }
    mat-radio-group {
      display: flex;
      gap: 16px;
    }
  `]
})
export class ExpenseFormDialogComponent {
  private fb = inject(FormBuilder);
  private store = inject(Store);
  private authService = inject(AuthService);
  expenseForm: any;
  categories = Object.values(ExpenseCategory);
  paymentModes = Object.values(PaymentMode);
  maxDate = new Date();

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: Expense | null,
    private dialogRef: MatDialogRef<ExpenseFormDialogComponent>
  ) {
    this.expenseForm = this.fb.group({
      amount: [this.data?.amount || 0, [Validators.required, Validators.min(1)]],
      category: [this.data?.category || '', [Validators.required]],
      description: [this.data?.description || '', [Validators.required, Validators.maxLength(200)]],
      date: [this.data ? new Date(this.data.date) : new Date(), [Validators.required]],
      paymentMode: [this.data?.paymentMode || PaymentMode.CASH, [Validators.required]]
    });
  }

  onCancel() {
    this.dialogRef.close();
  }

  async onSubmit() {
    if (this.expenseForm.valid) {
      const formValue = this.expenseForm.value;
      const expenseData = {
        amount: formValue.amount!,
        category: formValue.category as ExpenseCategory,
        description: formValue.description!,
        date: (formValue.date as Date).toISOString(),
        paymentMode: formValue.paymentMode as PaymentMode,
      };

      this.authService.user$.pipe(take(1)).subscribe(user => {
        if (!user) return;

        if (this.data) {
          this.store.dispatch(updateExpense({ 
            id: this.data.id, 
            expense: { ...expenseData, updatedAt: new Date().toISOString() } 
          }));
        } else {
          this.store.dispatch(addExpense({ 
            expense: { 
              ...expenseData, 
              createdBy: user.uid,
              createdAt: new Date().toISOString()
            } 
          }));
        }
        this.dialogRef.close();
      });
    }
  }
}
