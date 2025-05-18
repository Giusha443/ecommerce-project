import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { StorageService } from './storage.service';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { TokenResponse } from './api-response.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(
    private api: ApiService,
    private store: StorageService,
    private router: Router
  ) {}

  public login(email: string, password: string): Observable<TokenResponse> {
    return this.api.getCustomerToken({ email, password }).pipe(
      tap(response => {
        console.log('Login successful, saving token and redirecting');
        this.store.setTokens({
          accessToken: response.access_token,
          refreshToken: response.refresh_token || '',
        });
        // Redirect to main page after successful login
        this.router.navigate(['/main']);
      })
    );
  }

  public checkLoginStatus(): boolean {
    try {
      const tokens = this.store.getTokens();
      return !!tokens && !!tokens.accessToken;
    } catch (error) {
      console.error('Error checking login status:', error);
      return false;
    }
  }

  public logout(): void {
    console.log('Logging out and redirecting to login page');
    this.store.clearTokens(); // Make sure we have this method
    this.router.navigate(['/login']);
  }

  /**
   * Redirect authenticated users away from login page
   * @returns boolean indicating if redirect was performed
   */
  public redirectIfLoggedIn(): boolean {
    if (this.checkLoginStatus()) {
      console.log('User is logged in, redirecting to main');
      this.router.navigate(['/main']);
      return true;
    }
    console.log('User is not logged in, staying on login page');
    return false;
  }
}
