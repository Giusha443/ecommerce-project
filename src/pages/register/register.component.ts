import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup, AbstractControl } from '@angular/forms';
import { MatFormFieldModule, MatLabel } from '@angular/material/form-field';
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
import { AuthService } from '../../services/auth.service';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';
import { formatDate } from '@angular/common';

import { Inject, LOCALE_ID } from '@angular/core';

export interface Country {
  code: string;
  name: string;
}
interface CustomerData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
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

const MIN_YEARS_TO_LOGIN = 13;
const MIN_LENGTH_VALIDATE_PASSWORD = 8;
@Component({
  selector: 'app-register',
  providers: [provideNativeDateAdapter()],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatLabel,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatSnackBarModule,
    RouterLink,
    MatSelectModule,
    MatCheckbox,
    MatExpansionModule,
    MatDatepickerModule,
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
  private countYears = MIN_YEARS_TO_LOGIN;
  public hidePassword = true;
  public registerForm: FormGroup;
  public isValidForm = false;
  public panelOpenState = signal(false);
  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    private auth: AuthService,
    private router: Router,
    private snackBar: MatSnackBar,
    private storage: StorageService,
    @Inject(LOCALE_ID) public locale: string
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
          Validators.minLength(MIN_LENGTH_VALIDATE_PASSWORD),
          Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])?[A-Za-z\d!@#$%^&*]{8,}$/),
          Validators.pattern(/^\S+$/),
        ],
      ],
    });
  }
  public ngOnInit(): void {
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
  public onSubmit(): void {
    const formData = this.registerForm.value;

    const customerData: CustomerData = {
      email: formData.email,
      password: formData.password,
      firstName: formData.firstName,
      lastName: formData.lastName,
      dateOfBirth: formatDate(formData.dateOfBirth, 'yyyy-MM-dd', this.locale),
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
        this.auth.isAuthenticated$.next(true);
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

  public get firstNameRequiredError(): boolean {
    return this.registerForm.get('firstName')?.hasError('required') ?? false;
  }

  public get firstNamePatternError(): boolean {
    return this.registerForm.get('firstName')?.hasError('pattern') ?? false;
  }

  public get lastNameRequiredError(): boolean {
    return this.registerForm.get('lastName')?.hasError('required') ?? false;
  }

  public get lastNamePatternError(): boolean {
    return this.registerForm.get('lastName')?.hasError('pattern') ?? false;
  }

  public get dateOfBirthRequiredError(): boolean {
    return this.registerForm.get('dateOfBirth')?.hasError('required') ?? false;
  }

  public get dateOfBirthMinAgeError(): boolean {
    return this.registerForm.get('dateOfBirth')?.hasError('minAge') ?? false;
  }

  public get countryRequiredError(): boolean {
    return this.registerForm.get('country')?.hasError('required') ?? false;
  }

  public get cityRequiredError(): boolean {
    return this.registerForm.get('city')?.hasError('required') ?? false;
  }

  public get cityPatternError(): boolean {
    return this.registerForm.get('city')?.hasError('pattern') ?? false;
  }

  public get streetRequiredError(): boolean {
    return this.registerForm.get('street')?.hasError('required') ?? false;
  }
  public get postalCodeRequiredError(): boolean {
    return this.registerForm.get('postalCode')?.hasError('required') ?? false;
  }

  public get postalCodeValidError(): boolean {
    return this.registerForm.get('postalCode')?.hasError('postCodeValid') ?? false;
  }

  public get postalCodeBillingValidError(): boolean {
    return this.registerForm.get('postalCodeBilling')?.hasError('postCodeValid') ?? false;
  }

  public get postalCodeShippingValidError(): boolean {
    return this.registerForm.get('postalCodeShipping')?.hasError('postCodeValid') ?? false;
  }

  public get emailRequiredError(): boolean {
    return this.registerForm.get('email')?.hasError('required') ?? false;
  }

  public get emailFormatError(): boolean {
    return (
      (this.registerForm.get('email')?.hasError('email') || this.registerForm.get('email')?.hasError('pattern')) ??
      false
    );
  }

  public get passwordRequiredError(): boolean {
    return this.registerForm.get('password')?.hasError('required') ?? false;
  }

  public get passwordMinLengthError(): boolean {
    return this.registerForm.get('password')?.hasError('minlength') ?? false;
  }

  public get passwordPatternError(): boolean {
    return this.registerForm.get('password')?.hasError('pattern') ?? false;
  }

  public get isDefaultAddressValue(): boolean {
    return this.registerForm.get('isDefaultAddress')?.value ?? false;
  }

  public get isBothAddressValue(): boolean {
    return this.registerForm.get('isBothAddress')?.value ?? false;
  }
  public get firstName(): AbstractControl | null {
    return this.registerForm.get('firstName');
  }
  public get lastName(): AbstractControl | null {
    return this.registerForm.get('lastName');
  }
  public get dateOfBirth(): AbstractControl | null {
    return this.registerForm.get('dateOfBirth');
  }
  public get country(): AbstractControl | null {
    return this.registerForm.get('country');
  }
  public get city(): AbstractControl | null {
    return this.registerForm.get('city');
  }
  public get street(): AbstractControl | null {
    return this.registerForm.get('street');
  }
  public get email(): AbstractControl | null {
    return this.registerForm.get('email');
  }
  public get password(): AbstractControl | null {
    return this.registerForm.get('password');
  }
  public get postalCode(): AbstractControl | null {
    return this.registerForm.get('postalCode');
  }
  public get postalCodeBilling(): AbstractControl | null {
    return this.registerForm.get('postalCodeBilling');
  }
  public get postalCodeShipping(): AbstractControl | null {
    return this.registerForm.get('postalCodeShipping');
  }
}
