import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { StorageService } from '../../services/storage.service';
import { BehaviorSubject } from 'rxjs';

const TRUNCATION_LENGTH = 10;
@Component({
  selector: 'app-main',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatCardModule, MatDividerModule],
  template: `
    <div class="main-container">
      <mat-card class="auth-status-card">
        <mat-card-header>
          <mat-card-title>Authentication Test Page</mat-card-title>
          <mat-card-subtitle>Check if redirection is working</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <p>
            Authentication Status:
            <strong class="status" [class.autheduser]="isAuthenticatedPrivate$ | async">
              {{ (isAuthenticatedPrivate$ | async) ? 'Authenticated' : 'Not Authenticated' }}
            </strong>
          </p>

          <mat-divider class="my-3"></mat-divider>

          <div *ngIf="isAuthenticatedPrivate$ | async">
            <p>You have successfully logged in and were redirected to the main page.</p>
            <p>Token Info (truncated):</p>
            <pre>{{ tokenPreview }}</pre>
          </div>

          <div *ngIf="(isAuthenticatedPrivate$ | async) === false">
            <p>You should be redirected to login page soon...</p>
          </div>
        </mat-card-content>

        <mat-card-actions>
          <button mat-raised-button color="primary" (click)="checkAuthStatus()">Check Auth Status</button>
          <button mat-raised-button color="warn" (click)="logout()" *ngIf="isAuthenticatedPrivate$ | async">
            Logout
          </button>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [
    `
      .main-container {
        padding: 20px;
        display: flex;
        justify-content: center;
      }

      .auth-status-card {
        max-width: 33rem;
        width: 100%;
      }

      pre {
        background-color: #f5f5f5;
        padding: 10px;
        border-radius: 4px;
        overflow: auto;
      }

      .my-3 {
        margin: 1rem 0;
      }
      .status {
        color: red;
      }

      .autheduser {
        color: green;
      }
    `,
  ],
})
export class MainComponent implements OnInit {
  public isAuthenticatedPrivate$: BehaviorSubject<boolean>;
  public tokenPreview = '';
  constructor(
    private authService: AuthService,
    private storageService: StorageService,
    private router: Router
  ) {
    this.isAuthenticatedPrivate$ = this.authService.isAuthenticated$;
  }

  public ngOnInit(): void {
    this.authService.checkLoginStatus();
  }

  public checkAuthStatus(): void {
    const tokens = this.storageService.getTokens();
    // Safely show a preview of the token (first 10 chars)
    if (tokens && tokens.accessToken) {
      this.tokenPreview = `${tokens.accessToken.substring(0, TRUNCATION_LENGTH)}... (truncated for security)`;
    } else {
      this.tokenPreview = 'Token exists but cannot be displayed';
    }
  }

  public logout(): void {
    this.authService.logout();
  }
}
