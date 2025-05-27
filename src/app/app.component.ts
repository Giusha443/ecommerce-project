import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ApiService } from '../services/api.service';
import { StorageService } from '../services/storage.service';
import { HeaderComponent } from '../components/header/header.component';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  public title = 'ecommerce-project';
  constructor(
    private api: ApiService,
    private store: StorageService,
    private auth: AuthService
  ) {}

  public ngOnInit(): void {
    console.log('app');
    this.auth.isAuth$.subscribe();
    // this.initializeAuthState();
  }
}
