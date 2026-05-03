import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../../services/auth.service';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  template: `
    <div class="auth-container">
      <mat-card class="auth-card">
        <mat-card-header>
          <mat-card-title>Join GreenLedger</mat-card-title>
          <mat-card-subtitle>Start tracking your expenses</mat-card-subtitle>
        </mat-card-header>
        
        <mat-card-content>
          <form [formGroup]="signupForm" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Display Name</mat-label>
              <input matInput formControlName="displayName" placeholder="John Doe">
              <mat-error *ngIf="signupForm.get('displayName')?.hasError('required')">Name is required</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Email</mat-label>
              <input matInput type="email" formControlName="email" placeholder="you@example.com">
              <mat-error *ngIf="signupForm.get('email')?.hasError('required')">Email is required</mat-error>
              <mat-error *ngIf="signupForm.get('email')?.hasError('email')">Invalid email format</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Password</mat-label>
              <input matInput type="password" formControlName="password">
              <mat-error *ngIf="signupForm.get('password')?.hasError('required')">Password is required</mat-error>
              <mat-error *ngIf="signupForm.get('password')?.hasError('minlength')">Password must be at least 6 chars</mat-error>
            </mat-form-field>

            <button mat-raised-button color="primary" class="full-width" type="submit" [disabled]="signupForm.invalid || loading">
              {{ loading ? 'Creating Account...' : 'Sign Up' }}
            </button>
          </form>
        </mat-card-content>

        <mat-card-footer class="auth-footer">
          <p>Already have an account? <a routerLink="/login">Login</a></p>
        </mat-card-footer>
      </mat-card>
    </div>
  `,
  styles: [`
    .auth-container {
      height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      background: linear-gradient(135deg, #4caf50 0%, #2e7d32 100%);
    }
    .auth-card {
      width: 100%;
      max-width: 400px;
      padding: 16px;
    }
    .full-width {
      width: 100%;
      margin-bottom: 16px;
    }
    .auth-footer {
      text-align: center;
      padding: 16px;
    }
  `]
})
export class SignupComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private toastService = inject(ToastService);

  signupForm = this.fb.group({
    displayName: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  loading = false;

  async onSubmit() {
    if (this.signupForm.valid) {
      this.loading = true;
      try {
        const { email, password, displayName } = this.signupForm.value;
        await this.authService.signup(email!, password!, displayName!);
        this.toastService.success('Account created successfully!');
        this.router.navigate(['/dashboard']);
      } catch (error: any) {
        this.toastService.error(error.message || 'Signup failed');
      } finally {
        this.loading = false;
      }
    }
  }
}
