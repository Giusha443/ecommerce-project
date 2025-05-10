import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable, map } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | boolean {
    return this.authService.isAuthenticated().pipe(
      map(isAuthenticated => {
        // If this is the login route and user is already authenticated,
        // redirect to the main page
        if (state.url === '/login' && isAuthenticated) {
          this.router.navigate(['/main']);
          return false;
        }

        // If trying to access a protected route but not authenticated,
        // redirect to login
        if (state.url !== '/login' && !isAuthenticated) {
          this.router.navigate(['/login']);
          return false;
        }

        // Otherwise, allow the navigation
        return true;
      })
    );
  }
}
