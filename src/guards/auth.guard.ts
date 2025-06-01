import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { filter, map, skip, take, tap } from 'rxjs';
import { StorageService } from '../services/storage.service';

/**
 * Login guard to prevent authenticated users from accessing login page
 * Redirects to main page if user is already authenticated
 */
export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated$.getValue()) {
    return true;
  }
  router.navigate(['login']);
  return false;
};

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

/**
 * Login guard to prevent authenticated users from accessing login page
 * Redirects to main page if user is already authenticated
 */
export const loginGuardAlt: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  return authService.isAuthenticated$.pipe(
    skip(1),
    tap(isAuthenticated => {
      if (isAuthenticated) {
        router.navigate(['main']);
      }
    })
  );
};

export const profileGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const store = inject(StorageService);

  // Сначала быстрая синхронная проверка
  if (!store.getTokens().accessToken) {
    return router.createUrlTree(['/main']);
  }

  // Затем асинхронная проверка с ожиданием инициализации
  return auth.isAuth$.pipe(
    filter(state => state !== null), // Ждем пока состояние не станет не-null
    take(1),
    map(isAuthenticated => {
      return isAuthenticated ? true : router.createUrlTree(['/main']);
    })
  );
};
