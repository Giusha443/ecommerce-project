import { Component, OnInit } from '@angular/core';
import { NgClass } from '@angular/common';
import { BreakpointObserver } from '@angular/cdk/layout';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';
import { MenuItemComponent } from './menu-item/menu-item.component';
import { MenuItem } from '../../models/types';
import { MENU_ITEMS } from '../../constants/menu-items';
import { MatMenuModule } from '@angular/material/menu';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-menu',
  imports: [RouterLink, MenuItemComponent, NgClass, MatIconButton, MatIcon, MatMenuModule],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.scss',
})
export class MenuComponent implements OnInit {
  menuItems: MenuItem[] = MENU_ITEMS;
  burgerOn = false;
  breakPoint = '(max-width: 768px)';
  constructor(private breakpointObserver: BreakpointObserver) {}
  ngOnInit(): void {
    this.breakpointObserver.observe(this.breakPoint).subscribe(result => {
      this.burgerOn = result.matches;
    });
  }
}
