import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ApiService } from '../../services/api.service';
import { AddressEditDialogComponent } from '../../components/app-address-edit-dialog/app-address-edit-dialog.component';
import { AddressType, ProfileResponse } from '../../services/api-response.model';
import { MatIcon } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { minAgeValidator } from '../../utils/utils';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';
import { PasswordChangeDialogComponent } from '../../components/password-change-dialog/password-change-dialog.component';

const MIN_YEARS_TO_LOGIN = 13;
@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  providers: [provideNativeDateAdapter()],

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
    private dialog: MatDialog
  ) {
    this.profileForm = this.fb.group({
      firstName: [this.user?.firstName || '', Validators.required],
      lastName: [this.user?.lastName || '', Validators.required],
      email: [this.user?.email || '', [Validators.required, Validators.email]],
      dateOfBirth: ['', [Validators.required, minAgeValidator(this.countYears)]],
    });
  }

  public ngOnInit(): void {
    this.loadUserData();
  }

  private loadUserData(): void {
    this.api.getProfile().subscribe(user => {
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
          dateOfBirth: '2015-10-21',
        },
      ];

      this.api.updateUser(this.user.id, currentVersion, actions).subscribe({
        next: updatedUser => {
          if (updatedUser) {
            this.user = updatedUser;
            this.editMode = false;
          }
        },
        error: err => console.error('Update failed:', err),
      });
    }
  }

  public setDefaultAddress(type: 'billing' | 'shipping', addressId: string): void {
    if (this.user) {
      this.api.setDefaultAddress(this.user.id, type, addressId, this.user.version).subscribe(updatedUser => {
        if (updatedUser) {
          this.user = updatedUser;
        }
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
    dialogRef.afterClosed().subscribe(res => {
      console.log(res);
    });
  }
  public deleteAddress(address?: AddressType): void {
    if (!this.user) return;
    if (address?.id) {
      this.api.deleteAddress(this.user.id, address.id, this.user.version).subscribe(result => {
        if (result) this.loadUserData();
      });
    }
  }

  public trackByAddressId(): string {
    return Math.random().toString();
  }
}
