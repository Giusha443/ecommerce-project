import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Customer, CustomerProps, Introspect, ProductResponse, TokenResponse } from './api-response.model';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment.development';

@Injectable({ providedIn: 'root' })
export class ApiService {
  readonly authUrl = `${environment.host}/oauth/token`;
  readonly anonymousTokenUrl = `${environment.host}/oauth/${environment.projectKey}/anonymous/token`;
  readonly productsUrl = `${environment.apiUrl}/${environment.projectKey}/products`;
  readonly introspectUrl = `${environment.host}/${environment.projectKey}/oauth/introspect`;
  readonly customersUrl = `${environment.apiUrl}/${environment.projectKey}/customers`;
  readonly getCustomersTokenUrl = `${environment.host}/oauth/${environment.projectKey}/customers/token`;
  readonly refreshTokenUrl = `${environment.host}/oauth/token`;

  constructor(private http: HttpClient) {}

  getClientCredentialsToken(scope: string, path?: string): Observable<TokenResponse> {
    const body = new URLSearchParams();
    body.append('grant_type', 'client_credentials');
    body.append('scope', scope);
    return this.http.post<TokenResponse>(path || this.authUrl, body, {
      headers: this.getAuthHeaders(),
    });
  }

  getAnonymousToken(): Observable<TokenResponse> {
    const scope = `manage_project:${environment.projectKey}`;
    return this.getClientCredentialsToken(scope, this.anonymousTokenUrl);
  }

  getCustomerToken(credentials: { email: string; password: string }): Observable<TokenResponse> {
    const body = new URLSearchParams();
    body.append('grant_type', 'password');
    body.append('email', credentials.email);
    body.append('password', credentials.password);
    body.append('scope', `manage_project:${environment.projectKey}`);
    return this.http.post<TokenResponse>(this.getCustomersTokenUrl, body, {
      headers: this.getAuthHeaders(),
    });
  }

  refreshToken(refreshToken: string): Observable<TokenResponse> {
    const body = new URLSearchParams();
    body.append('grant_type', 'refresh_token');
    body.append('refresh_token', refreshToken);
    return this.http.post<TokenResponse>(this.refreshTokenUrl, body, {
      headers: this.getAuthHeaders(),
    });
  }

  introspectToken(token: string): Observable<Introspect> {
    const body = new URLSearchParams();
    body.append('token', token);
    return this.http.post<Introspect>(this.introspectUrl, body, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
  }

  createCustomer(customerData: CustomerProps): Observable<Customer> {
    return this.http.post<Customer>(this.customersUrl, customerData, {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  getProducts(): Observable<ProductResponse> {
    return this.http.get<ProductResponse>(this.productsUrl);
  }

  private getAuthHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${btoa(`${environment.clientId}:${environment.clientSecret}`)}`,
    });
  }
}
