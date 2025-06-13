import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ApiService } from '../../services/api.service';
import { AddressEditDialogComponent } from '../../components/app-address-edit-dialog/app-address-edit-dialog.component';
import { AddressType, ProfileResponse } from '../../services/api-response.model';
import { MatIcon } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule, formatDate } from '@angular/common';
import { minAgeValidator } from '../../utils/utils';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';
import { PasswordChangeDialogComponent } from '../../components/password-change-dialog/password-change-dialog.component';
import { Inject, LOCALE_ID } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError, throwError } from 'rxjs';

const MIN_YEARS_TO_LOGIN = 13;
@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  providers: [provideNativeDateAdapter()],
  encapsulation: ViewEncapsulation.None,
  imports: [
    MatIcon,
    ReactiveFormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    CommonModule,
    MatDatepickerModule,
  ],
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
  public user: ProfileResponse | undefined;
  public editMode = false;
  public profileForm: FormGroup;
  private countYears = MIN_YEARS_TO_LOGIN;

  constructor(
    private api: ApiService,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    @Inject(LOCALE_ID) public locale: string
  ) {
    this.profileForm = this.fb.group({
      firstName: [this.user?.firstName || '', Validators.required],
      lastName: [this.user?.lastName || '', Validators.required],
      email: [this.user?.email || '', [Validators.required, Validators.email]],
      dateOfBirth: [this.user?.dateOfBirth || '', [Validators.required, minAgeValidator(this.countYears)]],
    });
  }

  public ngOnInit(): void {
    this.loadUserData();
  }

  private loadUserData(): void {
    this.api.getProfile().subscribe(user => {
      console.log(user);

      this.user = user;
      this.profileForm.patchValue(user);
    });
  }

  public toggleEditMode(): void {
    this.editMode = !this.editMode;
    if (!this.editMode) {
      this.profileForm.reset(this.user);
    }
  }

  public saveProfile(): void {
    if (this.profileForm.valid && this.user) {
      const currentVersion = this.user.version;
      const actions = [
        {
          action: 'setFirstName',
          firstName: this.profileForm.value.firstName,
        },
        {
          action: 'setLastName',
          lastName: this.profileForm.value.lastName,
        },
        {
          action: 'changeEmail',
          email: this.profileForm.value.email,
        },
        {
          action: 'setDateOfBirth',
          dateOfBirth: formatDate(this.profileForm.value.dateOfBirth, 'yyyy-MM-dd', this.locale),
        },
      ];

      this.api.updateUser(this.user.id, currentVersion, actions).subscribe({
        next: updatedUser => {
          this.showSuccess('User updated');
          if (updatedUser) {
            this.user = updatedUser;
            this.editMode = false;
          }
        },
        error: err => {
          this.showError('Update failed');
          console.error('Update failed:', err);
        },
      });
    }
  }

  public setDefaultAddress(type: 'billing' | 'shipping', addressId: string): void {
    if (this.user) {
      this.api
        .setDefaultAddress(this.user.id, type, addressId, this.user.version)
        .pipe(
          catchError(err => {
            this.showError('Address not set');
            return throwError(() => err);
          })
        )
        .subscribe(updatedUser => {
          if (updatedUser) {
            this.user = updatedUser;
          }
          this.showSuccess('Address set!');
        });
    }
  }
  public openAddressEdit(address?: AddressType): void {
    const dialogRef = this.dialog.open(AddressEditDialogComponent, {
      data: {
        address,
        user: this.user,
      },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) this.loadUserData();
    });
  }
  public openPasswordChange(): void {
    const dialogRef = this.dialog.open(PasswordChangeDialogComponent, {
      data: {
        user: this.user,
      },
    });
    dialogRef.afterClosed();
  }
  public deleteAddress(address?: AddressType): void {
    if (!this.user) return;
    if (address?.id) {
      this.api
        .deleteAddress(this.user.id, address.id, this.user.version)
        .pipe(
          catchError(err => {
            this.showError('Address not deleted');
            return throwError(() => err);
          })
        )
        .subscribe(result => {
          if (result) this.loadUserData();
          this.showSuccess('Address deleted');
        });
    }
  }

  public trackByAddressId(): string {
    return Math.random().toString();
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
