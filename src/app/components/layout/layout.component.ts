import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    CommonModule, 
    RouterOutlet, 
    RouterLink, 
    RouterLinkActive,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatSidenavModule,
    MatListModule
  ],
  template: `
    <mat-toolbar color="primary" class="app-header">
      <button mat-icon-button (click)="sidenav.toggle()">
        <mat-icon>menu</mat-icon>
      </button>
      <span>🌿 GreenLedger</span>
      <span class="spacer"></span>
      <button mat-icon-button (click)="logout()" title="Logout">
        <mat-icon>logout</mat-icon>
      </button>
    </mat-toolbar>

    <mat-sidenav-container class="app-container">
      <mat-sidenav #sidenav mode="side" opened class="app-sidenav">
        <mat-nav-list>
          <a mat-list-item routerLink="/dashboard" routerLinkActive="active-link">
            <mat-icon matListItemIcon>dashboard</mat-icon>
            <span matListItemTitle>Dashboard</span>
          </a>
          <a mat-list-item routerLink="/expenses" routerLinkActive="active-link">
            <mat-icon matListItemIcon>receipt_long</mat-icon>
            <span matListItemTitle>Expenses</span>
          </a>
          <a mat-list-item routerLink="/summary" routerLinkActive="active-link">
            <mat-icon matListItemIcon>summarize</mat-icon>
            <span matListItemTitle>Summary</span>
          </a>
        </mat-nav-list>
      </mat-sidenav>

      <mat-sidenav-content class="app-content">
        <div class="main-wrapper">
          <router-outlet></router-outlet>
        </div>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [`
    .app-header {
      position: sticky;
      top: 0;
      z-index: 1000;
    }
    .spacer {
      flex: 1 1 auto;
    }
    .app-container {
      height: calc(100vh - 64px);
    }
    .app-sidenav {
      width: 240px;
      border-right: 1px solid rgba(0,0,0,0.12);
    }
    .app-content {
      padding: 24px;
      background-color: #f5f5f5;
    }
    .active-link {
      background-color: rgba(0,0,0,0.04);
      color: #3f51b5;
    }
    .main-wrapper {
      max-width: 1200px;
      margin: 0 auto;
    }
  `]
})
export class LayoutComponent {
  private authService = inject(AuthService);

  logout() {
    this.authService.logout();
  }
}
