import { Component, Input } from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-header-icons',
  imports: [MatIconButton, MatIcon, RouterLink],
  templateUrl: './header-icons.component.html',
  styleUrl: './header-icons.component.scss',
})
export class HeaderIconsComponent {
  @Input({ required: true }) isAuthedProp = false;
}
