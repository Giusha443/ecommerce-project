import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, RedirectCommand, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { filter, map, take } from 'rxjs';
import { StorageService } from '../services/storage.service';
import { ProductService } from '../services/product.service';

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
export const productGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const router = inject(Router);
  const productService = inject(ProductService);
  const id = route.paramMap.get('id');
  return productService.checkProductProjectionExistById(id!).pipe(
    map(can => {
      if (can) {
        return true;
      }
      const targetOfCurrentNavigation = router.getCurrentNavigation()?.finalUrl;
      const redirect = router.parseUrl('/notfound');
      return new RedirectCommand(redirect, { browserUrl: targetOfCurrentNavigation });
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
export const cartGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const store = inject(StorageService);

  if (!store.getTokens().accessToken) {
    return router.createUrlTree(['/login']);
  }

  return auth.isAuth$.pipe(
    filter(state => state !== null),
    take(1),
    map(isAuthenticated => {
      return isAuthenticated ? true : router.createUrlTree(['/login']);
    })
  );
};
