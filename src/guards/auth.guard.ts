import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, RedirectCommand, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map } from 'rxjs';
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
