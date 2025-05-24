import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ApiService } from '../services/api.service';
import { StorageService } from '../services/storage.service';
import { environment } from '../environments/environment.development';
import { HeaderComponent } from '../components/header/header.component';
import { AuthService } from '../services/auth.service';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  public title = 'ecommerce-project';
  private isAuthorised$: BehaviorSubject<boolean>;
  constructor(
    private api: ApiService,
    private store: StorageService,
    private auth: AuthService
  ) {
    this.isAuthorised$ = auth.isAuthenticated$;
  }
  public ngOnInit(): void {
    this.api.getClientCredentialsToken(`manage_project:${environment.projectKey}`).subscribe(data => {
      this.store.setTokens({ accessToken: data.access_token, refreshToken: data.refresh_token });
      this.auth.checkLoginStatus();
    });
  }
}
