import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ApiService } from '../services/api.service';
import { StorageService } from '../services/storage.service';

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
    this.getData();
    setTimeout(() => {
      this.getData2();
    }, 3000);
  }
  async getData() {
    try {
      const res = this.api.getAuthToken().subscribe(data => {
        this.store.setAccessToken(data.access_token);
      });
      console.log(res);
    } catch (e) {
      console.error('Error fetching customers:', e);
    }
  }
  async getData2() {
    try {
      this.api.getProducts().subscribe(data => {
        console.log(data);
      });
    } catch (e) {
      console.error('Error fetching customers:', e);
    }
  }
}
