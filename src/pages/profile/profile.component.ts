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

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  imports: [
    MatIcon,
    ReactiveFormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    CommonModule,
  ],
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
  public user: ProfileResponse | undefined;
  public editMode = false;
  public profileForm: FormGroup;

  constructor(
    private api: ApiService,
    private fb: FormBuilder,
    private dialog: MatDialog
  ) {
    this.profileForm = this.fb.group({
      firstName: [this.user?.firstName || '', Validators.required],
      lastName: [this.user?.lastName || '', Validators.required],
      email: [this.user?.email || '', [Validators.required, Validators.email]],
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
      console.log(result);

      if (result) this.loadUserData();
    });
  }
  public trackByAddressId(): string {
    return Math.random().toString();
  }
}
