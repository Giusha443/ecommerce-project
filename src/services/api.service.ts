import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ProductResponse, TokenResponse } from './api-response.model';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment.development';

@Injectable({ providedIn: 'root' })
export class ApiService {
  readonly authUrl = `${environment.host}/oauth/token`;
  readonly anonymousTokenUrl = `${environment.host}/oauth/${environment.projectKey}/anonymous/token`;
  readonly productsUrl = `${environment.apiUrl}/${environment.projectKey}/products`;

  constructor(private api: HttpClient) {}

  private requestToken(url: string): Observable<TokenResponse> {
    const params = new URLSearchParams();
    params.append('grant_type', 'client_credentials');
    params.append('scope', `manage_project:${environment.projectKey}`); //на счет scopa не уверен для анонима
    return this.api.post<TokenResponse>(url, params.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${btoa(`${environment.clientId}:${environment.clientSecret}`)}`,
      },
    });
  }

  getAuthToken(): Observable<TokenResponse> {
    return this.requestToken(this.authUrl);
  }

  getAnonymousToken(): Observable<TokenResponse> {
    return this.requestToken(this.anonymousTokenUrl);
  }

  getProducts() {
    return this.api.get<ProductResponse>(this.productsUrl);
  }
}
