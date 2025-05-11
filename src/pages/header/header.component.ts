import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LogoComponent } from '../../components/logo/logo.component';
import { MenuComponent } from '../../components/menu/menu.component';
import { HeaderIconsComponent } from '../../components/header-icons/header-icons.component';

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
