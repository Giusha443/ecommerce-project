import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class StorageService {
  private _accessToken$ = new BehaviorSubject<null | string>(null);
  private _refreshToken$ = new BehaviorSubject<null | string>(null);

  getAccessToken(): null | string {
    return this._accessToken$.getValue();
  }

  getRefreshToken(): null | string {
    return this._refreshToken$.getValue();
  }

  getTokens(): Record<string, null | string> {
    return { accessToken: this._accessToken$.getValue(), refreshToken: this._refreshToken$.getValue() };
  }

  setAccessToken(value: string) {
    this._accessToken$.next(value);
  }

  setRefreshToken(value: string) {
    this._refreshToken$.next(value);
  }

  setTokens({ accessToken, refreshToken }: Record<string, string | null>) {
    this._accessToken$.next(accessToken);
    this._refreshToken$.next(refreshToken);
  }
}
