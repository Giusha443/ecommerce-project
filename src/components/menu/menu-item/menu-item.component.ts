import { Component, Input } from '@angular/core';
import { MenuItem } from '../../../models/types';
import { RouterLink } from '@angular/router';
import { MatButton } from '@angular/material/button';

@Component({
  selector: 'app-menu-item',
  imports: [RouterLink, MatButton],
  templateUrl: './menu-item.component.html',
  styleUrl: './menu-item.component.scss',
})
export class MenuItemComponent {
  @Input() content: MenuItem = { item: '', route: '' };
}
