import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Auth guard to protect routes from unauthorized access
 * Redirects to login page if user is not authenticated
 */
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  console.log('Auth Guard - isLoggedIn:', authService.checkLoginStatus());

  if (authService.checkLoginStatus()) {
    return true;
  }

  // Redirect to login page and update browser history
  return router.createUrlTree(['/login']);
};

/**
 * Login guard to prevent authenticated users from accessing login page
 * Redirects to main page if user is already authenticated
 */
export const loginGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  console.log('Login Guard - isLoggedIn:', authService.checkLoginStatus());

  if (!authService.checkLoginStatus()) {
    console.log('Not logged in - allowing access to login page');
    return true;
  }

  console.log('Already logged in - redirecting to main');
  // Redirect to main page and update browser history
  return router.createUrlTree(['/main']);
};
