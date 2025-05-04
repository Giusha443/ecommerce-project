import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { StorageService } from '../storage.service';
import { Injectable } from '@angular/core';
import { ApiService } from '../api.service';

@Injectable({ providedIn: 'root' })
export class ApiInterceptor implements HttpInterceptor {
  constructor(
    private store: StorageService,
    private api: ApiService
  ) {}

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Здесь отрабатывает на REQUEST
    let modifiedReq = req.clone({});
    if (req.url !== this.api.authUrl && req.url !== this.api.anonymousToken) {
      const accessToken = this.store.getAccessToken();
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
    return next.handle(modifiedReq).pipe(
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
}
