import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LogoComponent } from '../logo/logo.component';
import { MenuComponent } from '../menu/menu.component';
import { HeaderIconsComponent } from './header-icons/header-icons.component';

@Component({
  selector: 'app-header',
  imports: [LogoComponent, MenuComponent, HeaderIconsComponent, RouterLink],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  // constructor(private auth: AuthService) {}
  public isUserLoggedIn = false;
  // onInit(): void {
  //   this.isUserLoggedIn = this.auth. // method checking if user is athorised
  // }
}
