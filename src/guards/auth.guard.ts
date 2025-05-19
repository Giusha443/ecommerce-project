import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { skip, tap } from 'rxjs';

/**
 * Auth guard to protect routes from unauthorized access
 * Redirects to login page if user is not authenticated
 */
export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  authService.checkLoginStatus();
  return authService.isAuthenticated$.pipe(
    skip(1),
    tap(isAuthenticated => {
      if (isAuthenticated) {
        router.navigate(['main']);
      }
    })
  );
};

/**
 * Login guard to prevent authenticated users from accessing login page
 * Redirects to main page if user is already authenticated
//  */
// export const loginGuard: CanActivateFn = () => {
//   const authService = inject(AuthService);
//   const router = inject(Router);
//   return authService.isAuthenticated$.pipe(
//     skip(1),
//     tap(isAuthenticated => {
//       if (isAuthenticated) {
//         router.navigate(['main']);
//       }
//     })
//   );
// };

/**
 * Login guard to prevent authenticated users from accessing login page
 * Redirects to main page if user is already authenticated
 */
export const loginGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated$.getValue()) {
    router.navigate(['main']);
    return false;
  }
  return true;
};
