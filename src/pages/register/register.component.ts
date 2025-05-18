import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup, AbstractControl } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { MatSelectModule } from '@angular/material/select';
import { StorageService } from '../../services/storage.service';
import { catchError, distinctUntilChanged, throwError } from 'rxjs';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatExpansionModule } from '@angular/material/expansion';
import { minAgeValidator, postalCodeValidator } from '../../utils/utils';
interface Country {
  code: string;
  name: string;
}
interface CustomerData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  addresses: {
    country: string;
    city: string;
    streetName: string;
    postalCode: string;
    defaultShippingAddress?: boolean;
    defaultBillingAddress?: boolean;
  }[];
  defaultShippingAddress?: number;
  defaultBillingAddress?: number;
}

@Component({
  selector: 'app-register',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatSnackBarModule,
    RouterLink,
    MatSelectModule,
    MatCheckbox,
    MatExpansionModule,
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent implements OnInit {
  public countries: Country[] = [
    { code: 'RU', name: 'Russia' },
    { code: 'BY', name: 'Belarus' },
    { code: 'US', name: 'United States' },
  ];
  private countYears = 13;
  public hidePassword = true;
  public registerForm: FormGroup;
  public isValidForm = false;
  public panelOpenState = signal(false);
  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    private router: Router,
    private snackBar: MatSnackBar,
    private storage: StorageService
  ) {
    this.registerForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.pattern(/^\p{L}*$/u)]],
      lastName: ['', [Validators.required, Validators.pattern(/^\p{L}*$/u)]],
      dateOfBirth: ['', [Validators.required, minAgeValidator(this.countYears)]],
      country: ['', [Validators.required]],
      countryBilling: [''],
      countryShipping: [''],
      city: ['', [Validators.required, Validators.pattern(/^\p{L}*$/u)]],
      cityBilling: [''],
      cityShipping: [''],
      street: ['', [Validators.required]],
      streetBilling: [''],
      streetShipping: [''],
      postalCode: ['', [Validators.required, postalCodeValidator('country')]],
      postalCodeBilling: ['', [postalCodeValidator('countryBilling')]],
      postalCodeShipping: ['', [postalCodeValidator('countryShipping')]],
      isDefaultAddress: [''],
      isBothAddress: [''],
      email: ['', [Validators.required, Validators.email, Validators.pattern(/^\S+@\S+\.\S+$/)]],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])?[A-Za-z\d!@#$%^&*]{8,}$/),
          Validators.pattern(/^\S+$/),
        ],
      ],
    });
  }
  ngOnInit(): void {
    this.registerForm.valueChanges
      .pipe(
        distinctUntilChanged((prev, curr) => {
          return (
            prev.country === curr.country &&
            prev.countryBilling === curr.countryBilling &&
            prev.countryShipping === curr.countryShipping
          );
        })
      )
      .subscribe(() => {
        this.registerForm.get('postalCode')?.updateValueAndValidity();
        this.registerForm.get('postalCodeBilling')?.updateValueAndValidity();
        this.registerForm.get('postalCodeShipping')?.updateValueAndValidity();
      });
  }
  onSubmit(): void {
    const formData = this.registerForm.value;
    const customerData: CustomerData = {
      email: formData.email,
      password: formData.password,
      firstName: formData.firstName,
      lastName: formData.lastName,
      addresses: [
        {
          country: formData.country,
          city: formData.city,
          streetName: formData.street,
          postalCode: formData.postalCode,
        },
      ],
    };

    if (formData.countryBilling) {
      customerData.addresses.push({
        country: formData.countryBilling,
        city: formData.cityBilling,
        streetName: formData.streetBilling,
        postalCode: formData.postalCodeBilling,
      });
      customerData.defaultBillingAddress = 1;
      if (formData.isBothAddress) {
        customerData.defaultShippingAddress = 1;
        customerData.defaultBillingAddress = 1;
      }
      if (formData.countryShipping) {
        customerData.addresses.push({
          country: formData.countryShipping,
          city: formData.cityShipping,
          streetName: formData.streetShipping,
          postalCode: formData.postalCodeShipping,
        });
        customerData.defaultShippingAddress = 2;
      }
    } else {
      if (formData.countryShipping) {
        customerData.addresses.push({
          country: formData.countryShipping,
          city: formData.cityShipping,
          streetName: formData.streetShipping,
          postalCode: formData.postalCodeShipping,
        });
        customerData.defaultShippingAddress = 1;
      }
    }

    if (formData.isDefaultAddress) {
      customerData.defaultShippingAddress = 0;
      customerData.defaultBillingAddress = 0;
    }
    this.api
      .createCustomer(customerData)
      .pipe(
        catchError(err => {
          this.showError('Registration failed');
          return throwError(() => err);
        })
      )
      .subscribe(() => {
        this.loginAfterRegistration(formData);
      });
  }

  private loginAfterRegistration(formData: { email: string; password: string }): void {
    this.api
      .getCustomerToken({ email: formData.email, password: formData.password })
      .pipe(
        catchError(error => {
          this.showError('Login after registration failed');
          return throwError(() => error);
        })
      )
      .subscribe(data => {
        this.storage.setTokens({ accessToken: data.access_token, refreshToken: data.refresh_token });
        this.router.navigate(['']);
        this.showSuccess('Login successful (stubbed)!');
      });
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
    });
  }

  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
    });
  }

  get firstName(): AbstractControl | null {
    return this.registerForm.get('firstName');
  }
  get lastName(): AbstractControl | null {
    return this.registerForm.get('lastName');
  }
  get dateOfBirth(): AbstractControl | null {
    return this.registerForm.get('dateOfBirth');
  }
  get country(): AbstractControl | null {
    return this.registerForm.get('country');
  }
  get city(): AbstractControl | null {
    return this.registerForm.get('city');
  }
  get street(): AbstractControl | null {
    return this.registerForm.get('street');
  }
  get email(): AbstractControl | null {
    return this.registerForm.get('email');
  }
  get password(): AbstractControl | null {
    return this.registerForm.get('password');
  }
  get postalCode(): AbstractControl | null {
    return this.registerForm.get('postalCode');
  }
  get postalCodeBilling(): AbstractControl | null {
    return this.registerForm.get('postalCodeBilling');
  }
  get postalCodeShipping(): AbstractControl | null {
    return this.registerForm.get('postalCodeShipping');
  }
}
