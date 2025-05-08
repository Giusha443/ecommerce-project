import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { MatSelectModule } from '@angular/material/select';

interface Country {
  code: string;
  name: string;
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
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  countries: Country[] = [
    { code: 'RU', name: 'Russia' },
    { code: 'BY', name: 'Belarus' },
    { code: 'US', name: 'United States' },
  ];
  public hidePassword = true;
  public registerForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.registerForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(4)]],
      lastName: ['', [Validators.required, Validators.minLength(4)]],
      dateOfBirth: ['', [Validators.required]],
      country: ['', [Validators.required]],
      city: ['', [Validators.required]],
      street: ['', [Validators.required]],
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
  onSubmit() {
    if (this.registerForm.invalid) {
      this.showError('Please correct the validation errors.');
      return;
    }

    const formData = this.registerForm.value;
    const customerData = {
      email: formData.email,
      password: formData.password,
      firstName: formData.firstName,
      lastName: formData.lastName,
      addresses: [
        {
          country: formData.country,
          city: formData.city,
          streetName: formData.street,
        },
      ],
    };
    this.api.createCustomer(customerData).subscribe(
      () => {
        this.loginAfterRegistration(formData);
      },
      err => {
        this.showError(err.message || 'Registration failed');
      }
    );
  }

  private loginAfterRegistration(formData: { email: string; password: string }) {
    this.api.getCustomerToken({ email: formData.email, password: formData.password }).subscribe(
      () => {
        this.router.navigate(['']);
        this.showSuccess('Login successful (stubbed)!');
      },
      err => {
        this.showError(err.message || 'Login after registration failed');
      }
    );
  }

  private showError(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
    });
  }

  private showSuccess(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
    });
  }

  get firstName() {
    return this.registerForm.get('firstName');
  }
  get lastName() {
    return this.registerForm.get('lastName');
  }
  get dateOfBirth() {
    return this.registerForm.get('dateOfBirth');
  }
  get country() {
    return this.registerForm.get('country');
  }
  get city() {
    return this.registerForm.get('city');
  }
  get street() {
    return this.registerForm.get('street');
  }
  get email() {
    return this.registerForm.get('email');
  }
  get password() {
    return this.registerForm.get('password');
  }
}
