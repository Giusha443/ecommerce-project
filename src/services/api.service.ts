import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {
  Customer,
  CustomerProps,
  Introspect,
  ProductResponse,
  ProfileResponse,
  TokenResponse,
} from './api-response.model';
import { catchError, Observable, of } from 'rxjs';
import { environment } from '../environments/environment.development';

@Injectable({ providedIn: 'root' })
export class ApiService {
  public readonly authUrl = `${environment.host}/oauth/token`;
  public readonly anonymousTokenUrl = `${environment.host}/oauth/${environment.projectKey}/anonymous/token`;
  public readonly productsUrl = `${environment.apiUrl}/${environment.projectKey}/products`;
  public readonly introspectUrl = `${environment.host}/oauth/introspect`;
  public readonly customersUrl = `${environment.apiUrl}/${environment.projectKey}/customers`;
  public readonly getCustomersTokenUrl = `${environment.host}/oauth/${environment.projectKey}/customers/token`;
  public readonly refreshTokenUrl = `${environment.host}/oauth/token`;
  public readonly getProfileUrl = `${environment.apiUrl}/${environment.projectKey}/me`;
  public readonly changePasswordProfileUrl = `${environment.apiUrl}/${environment.projectKey}/me/password `;

  constructor(private http: HttpClient) {}

  public getClientCredentialsToken(scope: string, path?: string): Observable<TokenResponse> {
    const body = new URLSearchParams();
    body.append('grant_type', 'client_credentials');
    body.append('scope', scope);
    return this.http.post<TokenResponse>(path || this.authUrl, body, {
      headers: this.getAuthHeaders(),
    });
  }

  public getAnonymousToken(): Observable<TokenResponse> {
    const scope = `manage_project:${environment.projectKey}`;
    return this.getClientCredentialsToken(scope, this.anonymousTokenUrl);
  }

  public getCustomerToken(credentials: { email: string; password: string }): Observable<TokenResponse> {
    const body = new URLSearchParams();
    body.append('grant_type', 'password');
    body.append('username', credentials.email);
    body.append('password', credentials.password);
    body.append('scope', `manage_project:${environment.projectKey}`);
    return this.http.post<TokenResponse>(this.getCustomersTokenUrl, body, {
      headers: this.getAuthHeaders(),
    });
  }

  public refreshToken(refreshToken: string): Observable<TokenResponse> {
    const body = new URLSearchParams();
    body.append('grant_type', 'refresh_token');
    body.append('refresh_token', refreshToken);
    return this.http.post<TokenResponse>(this.refreshTokenUrl, body, {
      headers: this.getAuthHeaders(),
    });
  }

  public introspectToken(token: string): Observable<Introspect> {
    const body = new URLSearchParams();
    body.append('token', token);

    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${btoa(`${environment.clientId}:${environment.clientSecret}`)}`,
    });

    return this.http.post<Introspect>(this.introspectUrl, body.toString(), { headers }).pipe(
      catchError(error => {
        console.error('Introspection error:', error);
        return of({ active: false } as Introspect);
      })
    );
  }

  public createCustomer(customerData: CustomerProps): Observable<Customer> {
    return this.http.post<Customer>(this.customersUrl, customerData, {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  public getProducts(): Observable<ProductResponse> {
    return this.http.get<ProductResponse>(this.productsUrl);
  }
  public getProfile(): Observable<ProfileResponse> {
    return this.http.get<ProfileResponse>(this.getProfileUrl);
  }
  private getAuthHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${btoa(`${environment.clientId}:${environment.clientSecret}`)}`,
    });
  }

  public updateUser(customerId: string, version: number, actions: unknown[]): Observable<ProfileResponse | null> {
    const url = `${this.customersUrl}/${customerId}`;
    return this.http
      .post<ProfileResponse>(url, { version, actions }, { headers: { 'Content-Type': 'application/json' } })
      .pipe(
        catchError(error => {
          console.error('Update user error:', error);
          return of(null);
        })
      );
  }
  public changePassword(params: {
    version: string;
    currentPassword: string;
    newPassword: string;
  }): Observable<ProfileResponse | null> {
    return this.http
      .post<ProfileResponse>(this.changePasswordProfileUrl, params, { headers: { 'Content-Type': 'application/json' } })
      .pipe(
        catchError(error => {
          console.error('Update user error:', error);
          return of(null);
        })
      );
  }
  public setDefaultAddress(
    customerId: string,
    type: 'billing' | 'shipping',
    addressId: string,
    version: number
  ): Observable<ProfileResponse | null> {
    const actionType = type === 'billing' ? 'setDefaultBillingAddress' : 'setDefaultShippingAddress';

    return this.http
      .post<ProfileResponse>(
        `${this.customersUrl}/${customerId}`,
        { version, actions: [{ action: actionType, addressId }] },
        { headers: { 'Content-Type': 'application/json' } }
      )
      .pipe(
        catchError(error => {
          console.error('Set default address error:', error);
          return of(null);
        })
      );
  }

  public createAddress(customerId: string, addressData: unknown, version: number): Observable<ProfileResponse | null> {
    return this.http
      .post<ProfileResponse>(
        `${this.customersUrl}/${customerId}`,
        {
          version,
          actions: [
            {
              action: 'addAddress',
              address: addressData,
            },
          ],
        },
        { headers: { 'Content-Type': 'application/json' } }
      )
      .pipe(
        catchError(error => {
          console.error('Create address error:', error);
          return of(null);
        })
      );
  }

  public updateAddress(
    customerId: string,
    addressId: string,
    addressData: unknown,
    version: number
  ): Observable<ProfileResponse | null> {
    return this.http
      .post<ProfileResponse>(
        `${this.customersUrl}/${customerId}`,
        {
          version,
          actions: [
            {
              action: 'changeAddress',
              addressId,
              address: addressData,
            },
          ],
        },
        { headers: { 'Content-Type': 'application/json' } }
      )
      .pipe(
        catchError(error => {
          console.error('Update address error:', error);
          return of(null);
        })
      );
  }
  public deleteAddress(customerId: string, addressId: string, version: number): Observable<ProfileResponse | null> {
    return this.http
      .post<ProfileResponse>(
        `${this.customersUrl}/${customerId}`,
        {
          version,
          actions: [
            {
              action: 'removeAddress',
              addressId,
            },
          ],
        },
        { headers: { 'Content-Type': 'application/json' } }
      )
      .pipe(
        catchError(error => {
          console.error('Remove address error:', error);
          return of(null);
        })
      );
  }
}
