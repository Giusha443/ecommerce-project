import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { StorageService } from './storage.service';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { TokenResponse } from './api-response.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  public isAuthenticated$: BehaviorSubject<boolean>;
  constructor(
    private api: ApiService,
    private store: StorageService,
    private router: Router
  ) {
    this.isAuthenticated$ = new BehaviorSubject(false);
  }

  login(email: string, password: string): Observable<TokenResponse> {
    return this.api.getCustomerToken({ email, password }).pipe(
      tap(response => {
        console.log('Login successful, saving token and redirecting');
        this.store.setTokens({
          accessToken: response.access_token,
          refreshToken: response.refresh_token || '',
        });
        this.isAuthenticated$.next(true);
        // Redirect to main page after successful login
        this.router.navigate(['main']);
      })
    );
  }

  checkLoginStatus(): boolean {
    try {
      const tokens = this.store.getTokens();
      if (!!tokens && !!tokens.accessToken) {
        this.isAuthenticated$.next(true);
        return true;
      }
    } catch (error) {
      console.error('Error checking login status:', error);
    }
    return false;
  }

  logout(): void {
    this.store.clearTokens(); // Make sure we have this method
    this.isAuthenticated$.next(false);
    this.router.navigate(['main']);
  }

  /**
   * It looks unused anywhere!
   *
   * Redirect authenticated users away from login page
   * @returns boolean indicating if redirect was performed
   */
  redirectIfLoggedIn(): boolean {
    if (this.checkLoginStatus()) {
      console.log('User is logged in, redirecting to main');
      this.router.navigate(['/main']);
      return true;
    }
    console.log('User is not logged in, staying on login page');
    return false;
  }
}
