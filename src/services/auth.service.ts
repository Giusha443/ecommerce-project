// import { Injectable } from '@angular/core';
// import { Router } from '@angular/router';
// import { BehaviorSubject, Observable, tap } from 'rxjs';
// import { ApiService } from './api.service';
// import { StorageService } from './storage.service';
// import { TokenResponse } from './api-response.model';

// @Injectable({
//   providedIn: 'root',
// })
// export class AuthService {
//   private isAuthenticated$ = new BehaviorSubject<boolean>(false);

//   constructor(
//     private apiService: ApiService,
//     private storageService: StorageService,
//     private router: Router
//   ) {
//     // Check if there's a token in the storage service on initialization
//     this.storageService.accessToken$.subscribe(token => {
//       this.isAuthenticated$.next(!!token);
//     });
//   }

//   login(email: string, password: string): Observable<TokenResponse> {
//     return this.apiService.getAuthToken().pipe(
//       tap((response: TokenResponse) => {
//         // Store the tokens
//         this.storageService.accessToken$.next(response.access_token);
//         if (response.refresh_token) {
//           this.storageService.refreshToken$.next(response.refresh_token);
//         }
//         this.isAuthenticated$.next(true);

//         // Redirect to main page after successful login
//         this.router.navigate(['/main']);
//       })
//     );
//   }

//   public logout(): void {
//     // Clear tokens and set authentication status to false
//     this.storageService.accessToken$.next(null);
//     this.storageService.refreshToken$.next(null);
//     this.isAuthenticated$.next(false);

//     // Redirect to login page
//     this.router.navigate(['/login']);
//   }

//   public isAuthenticated(): Observable<boolean> {
//     return this.isAuthenticated$.asObservable();
//   }

//   // Method to check if the user is logged in
//   public checkLoginStatus(): boolean {
//     return this.isAuthenticated$.getValue();
//   }
// }
