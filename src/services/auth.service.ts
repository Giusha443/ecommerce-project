import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { StorageService } from './storage.service';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { Introspect, TokenResponse } from './api-response.model';
import { accessVerificationCustomer } from '../utils/utils';
import { environment } from '../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  public isAuthenticated$ = new BehaviorSubject<boolean>(false);
  public isAuth$ = this.isAuthenticated$.asObservable();

  constructor(
    private api: ApiService,
    private store: StorageService,
    private router: Router
  ) {
    this.initializeAuth();
  }
  private initializeAuth(): void {
    const { accessToken, refreshToken } = this.store.getTokens();

    if (!accessToken) {
      this.fetchNewClientCredentials();
      return;
    }

    this.api.introspectToken(accessToken).subscribe({
      next: res => this.handleAuthResponse(res, refreshToken),
      error: () => this.isAuthenticated$.next(false),
    });
  }

  private handleAuthResponse(introspection: Introspect, refreshToken?: string): void {
    if (!introspection.active) {
      this.handleTokenRefresh(refreshToken);
      return;
    }
    const isAuthorized = !!introspection.scope && accessVerificationCustomer(introspection.scope);
    this.isAuthenticated$.next(isAuthorized);
  }

  private handleTokenRefresh(refreshToken?: string): void {
    if (!refreshToken) {
      this.isAuthenticated$.next(false);
      return;
    }

    this.api.refreshToken(refreshToken).subscribe({
      next: tokens => {
        this.store.setTokens({ accessToken: tokens.access_token, refreshToken: tokens.refresh_token });
        this.isAuthenticated$.next(true);
      },
      error: () => this.isAuthenticated$.next(false),
    });
  }

  private fetchNewClientCredentials(): void {
    this.api.getClientCredentialsToken(`manage_project:${environment.projectKey}`).subscribe({
      next: tokens => this.store.setTokens({ accessToken: tokens.access_token, refreshToken: tokens.refresh_token }),
      error: () => this.isAuthenticated$.next(false),
    });
  }

  public login(email: string, password: string): Observable<TokenResponse> {
    return this.api.getCustomerToken({ email, password }).pipe(
      tap(response => {
        this.store.setTokens({
          accessToken: response.access_token,
          refreshToken: response.refresh_token || '',
        });
        this.isAuthenticated$.next(true);
        this.router.navigate(['main']);
      })
    );
  }

  public checkLoginStatus(): boolean {
    try {
      return this.isAuthenticated$.getValue();
    } catch (error) {
      console.error('Error checking login status:', error);
    }
    return false;
  }

  public logout(): void {
    this.store.clearTokens();
    this.isAuthenticated$.next(false);
    this.router.navigate(['main']);
    this.fetchNewClientCredentials();
  }
}
