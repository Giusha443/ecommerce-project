import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Auth guard to protect routes from unauthorized access
 * Redirects to login page if user is not authenticated
 */
export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated.getValue()) {
    return true;
  }
  router.navigate(['main']);
  return false;
};

/**
 * Login guard to prevent authenticated users from accessing login page
 * Redirects to main page if user is already authenticated
 */
export const loginGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  console.log('checkLoginStatus', authService.checkLoginStatus());
  console.log('isAuthenticated', authService.isAuthenticated.getValue());

  if (authService.isAuthenticated.getValue()) {
    router.navigate(['main']);
    return false;
  }
  return true;
};
