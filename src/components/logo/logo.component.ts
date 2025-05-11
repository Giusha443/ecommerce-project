import { Component } from '@angular/core';
import { LogoIconComponent } from './logo-icon/logo-icon.component';
import { MatButton } from '@angular/material/button';

@Component({
  selector: 'app-logo',
  imports: [LogoIconComponent, MatButton],
  templateUrl: './logo.component.html',
  styleUrl: './logo.component.scss',
})
export class LogoComponent {}
