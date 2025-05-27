import { Component, Inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { AddressType, ProfileResponse } from '../../services/api-response.model';
import { MatFormField, MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { type Country } from '../../pages/register/register.component';
import { MatSelectModule } from '@angular/material/select';
import { postalCodeValidator } from '../../utils/utils';
import { MatButton } from '@angular/material/button';

@Component({
  selector: 'app-app-address-edit-dialog',
  imports: [
    MatDialogActions,
    MatFormField,
    MatDialogContent,
    ReactiveFormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatDialogModule,
    MatSelectModule,
    MatDialogClose,
    MatButton,
  ],
  templateUrl: './app-address-edit-dialog.component.html',
  styleUrls: ['./app-address-edit-dialog.component.scss'],
})
export class AddressEditDialogComponent {
  public addressForm: FormGroup;
  public countries: Country[] = [
    { code: 'RU', name: 'Russia' },
    { code: 'BY', name: 'Belarus' },
    { code: 'US', name: 'United States' },
  ];
  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    public dialogRef: MatDialogRef<AddressEditDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { address: AddressType; user: ProfileResponse }
  ) {
    this.addressForm = this.fb.group({
      streetName: [this.data.address.streetName || '', [Validators.required]],
      city: [this.data.address.city || '', [Validators.required]],
      postalCode: [this.data.address.postalCode || '', [Validators.required, postalCodeValidator('country')]],
      country: [this.data.address.country || '', [Validators.required]],
    });
  }

  public saveAddress(): void {
    if (this.addressForm.valid && this.data.user) {
      const addressData = this.addressForm.value;
      const version = this.data.user.version;

      if (this.data.address) {
        this.api
          .updateAddress(this.data.user.id, this.data.address.id, addressData, version)
          .subscribe(() => this.dialogRef.close(true));
      } else {
        this.api.createAddress(this.data.user.id, addressData, version).subscribe(() => this.dialogRef.close(true));
      }
    }
  }
}
