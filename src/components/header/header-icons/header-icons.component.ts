import { Component } from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-header-icons',
  imports: [MatIconButton, MatIcon, RouterLink],
  templateUrl: './header-icons.component.html',
  styleUrl: './header-icons.component.scss',
})
export class HeaderIconsComponent {
  public isAuthed: BehaviorSubject<boolean>;
  constructor(private auth: AuthService) {
    this.isAuthed = this.auth.isAuthenticated;
  }
}
