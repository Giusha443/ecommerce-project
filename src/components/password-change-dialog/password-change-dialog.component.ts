import { Component, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogContent,
  MatDialogActions,
  MatDialogClose,
} from '@angular/material/dialog';
import { ProfileResponse } from '../../services/api-response.model';
import { ApiService } from '../../services/api.service';
import { AddressEditDialogComponent } from '../app-address-edit-dialog/app-address-edit-dialog.component';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule, MatLabel } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../../services/auth.service';
const MIN_LENGTH_VALIDATE_PASSWORD = 8;

@Component({
  selector: 'app-password-change-dialog',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatLabel,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatSnackBarModule,
    MatSelectModule,
    MatExpansionModule,
    MatDatepickerModule,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
  ],
  templateUrl: './password-change-dialog.component.html',
  styleUrl: './password-change-dialog.component.scss',
})
export class PasswordChangeDialogComponent {
  public passwordForm: FormGroup;
  public hidePassword = true;

  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    private auth: AuthService,
    public dialogRef: MatDialogRef<AddressEditDialogComponent>,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: { user: ProfileResponse }
  ) {
    this.passwordForm = this.fb.group({
      currentPassword: ['', [Validators.required]],
      newPassword: [
        '',
        [
          Validators.required,
          Validators.minLength(MIN_LENGTH_VALIDATE_PASSWORD),
          Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])?[A-Za-z\d!@#$%^&*]{8,}$/),
          Validators.pattern(/^\S+$/),
        ],
      ],
    });
  }

  public changePassword(): void {
    if (this.data.user) {
      const version = this.data.user.version;
      const passwordData = this.passwordForm.value;

      this.api
        .changePassword({ ...passwordData, version })
        .pipe(
          catchError(err => {
            this.showError('Password not changed');
            return throwError(() => err);
          })
        )
        .subscribe(val => {
          console.log(val);
          console.log(this.auth.isAuthenticated$);

          this.showSuccess('Password changed');
          this.dialogRef.close(true);
        });
    }
  }

  public get passwordRequiredError(): boolean {
    return this.passwordForm.get('newPassword')?.hasError('required') ?? false;
  }

  public get passwordMinLengthError(): boolean {
    return this.passwordForm.get('newPassword')?.hasError('minlength') ?? false;
  }

  public get passwordPatternError(): boolean {
    return this.passwordForm.get('newPassword')?.hasError('pattern') ?? false;
  }
  private showError(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 2000,
      panelClass: ['error-snackbar'],
    });
  }

  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 2000,
      panelClass: ['success-snackbar'],
    });
  }
}
