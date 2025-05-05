import { HttpErrorResponse, HttpEvent, HttpHandlerFn, HttpRequest, HttpResponse } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { StorageService } from '../storage.service';
import { inject } from '@angular/core';
import { ApiService } from '../api.service';

export function intercept(req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
  // Здесь отрабатывает на REQUEST
  const api = inject(ApiService);
  const store = inject(StorageService);
  let modifiedReq = req.clone({});
  if (req.url !== api.authUrl && req.url !== api.anonymousTokenUrl) {
    const accessToken = store.accessToken$.getValue();

    if (!accessToken) {
      //перенаправить на станицу логина
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
          // Здесь отрабатывает на RESPONSE
        }
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error Intercepted:', err);
        if (err.status === 401) {
          //запрос на  обновление токена
        }
        // Здесь обрабатывает ошибку
      },
    })
  );
}
