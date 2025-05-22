import { Component, OnInit } from '@angular/core';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-logo',
  template: '',
})
export class LogOutComponent implements OnInit {
  private snackBar: MatSnackBar;
  private horizontalPosition: MatSnackBarHorizontalPosition = 'center';
  private verticalPosition: MatSnackBarVerticalPosition = 'top';
  constructor(private auth: AuthService) {
    this.snackBar = new MatSnackBar();
  }
  public ngOnInit(): void {
    // TODO: may be a username|e-mail to say bye `${user | email} logged out` or `Bye ${username | email}`
    this.snackBar.open('Logged out', '', {
      duration: 2000,
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
    });
    this.auth.logout();
  }
}
