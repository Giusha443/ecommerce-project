import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ApiService } from '../services/api.service';
import { StorageService } from '../services/storage.service';
import { environment } from '../environments/environment.development';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  title = 'ecommerce-project';
  constructor(
    private api: ApiService,
    private store: StorageService
  ) {}
  ngOnInit() {
    this.api.getClientCredentialsToken(`manage_project:${environment.projectKey}`).subscribe(data => {
      this.store.setTokens({ accessToken: data.access_token, refreshToken: data.refresh_token });
    });
  }
}
