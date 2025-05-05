import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class StorageService {
  accessToken$ = new BehaviorSubject<null | string>(null);
  refreshToken$ = new BehaviorSubject<null | string>(null);
}
