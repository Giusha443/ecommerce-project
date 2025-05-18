import { HttpErrorResponse, HttpEvent, HttpHandlerFn, HttpRequest, HttpResponse } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { StorageService } from '../services/storage.service';
import { inject } from '@angular/core';
import { ApiService } from '../services/api.service';
import { Router } from '@angular/router';

const INVALID_TOKEN_ERROR = 401;

export function intercept(req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
  // Intercept and handle request
  const api = inject(ApiService);
  const store = inject(StorageService);
  const router = inject(Router);

  let modifiedReq = req.clone({});
  if (
    req.url !== api.authUrl &&
    req.url !== api.anonymousTokenUrl &&
    req.url !== api.refreshTokenUrl &&
    req.url !== api.getCustomersTokenUrl
  ) {
    const accessToken = store.getTokens().accessToken;
    if (!accessToken) {
      // Redirect to login page if token is not found
      router.navigate(['/login']);
      throw Error('Token is not found');
    }
    modifiedReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  }

  return next(modifiedReq).pipe(
    tap({
      next: (event: HttpEvent<unknown>) => {
        if (event instanceof HttpResponse) {
          console.log('Response Intercepted:', event);
          // Handle response if needed
        }
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error Intercepted:', err);
        if (err.status === INVALID_TOKEN_ERROR) {
          // Handle unauthorized access
          // Redirect to login page
          router.navigate(['/login']);
        }
      },
    })
  );
}
