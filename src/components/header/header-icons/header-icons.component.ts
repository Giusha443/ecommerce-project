import { Component } from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { BehaviorSubject } from 'rxjs';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-header-icons',
  imports: [MatIconButton, MatIcon, RouterLink, AsyncPipe],
  templateUrl: './header-icons.component.html',
  styleUrl: './header-icons.component.scss',
})
export class HeaderIconsComponent {
  public isAuthenticatedPrivate$: BehaviorSubject<boolean>;
  constructor(private auth: AuthService) {
    this.isAuthenticatedPrivate$ = this.auth.isAuthenticated$;
  }
}
