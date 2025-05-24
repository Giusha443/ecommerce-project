import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup, AbstractControl } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

const AUTH_PASSWORD_MIN_LENGTH = 8;
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatSnackBarModule,
    RouterLink,
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  public hidePassword = true;
  public loginForm: FormGroup;
  public loading = false;

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private authService: AuthService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email, Validators.pattern(/^\S+@\S+\.\S+$/)]],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(AUTH_PASSWORD_MIN_LENGTH),
          Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])?[A-Za-z\d!@#$%^&*]{8,}$/),
          Validators.pattern(/^\S+$/),
        ],
      ],
    });
  }

  public onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;
    const { email, password } = this.loginForm.value;
    console.log('Attempting login for:', email);

    this.authService.login(email, password).subscribe({
      next: response => {
        console.log('Login response received', response);
        this.snackBar.open('Login successful!', 'X', { duration: 3000 });
        // No need to navigate here - the AuthService handles it
      },
      error: error => {
        console.error('Login error:', error);
        this.snackBar.open('Login failed. Please check your credentials.', 'X', { duration: 5000 });
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      },
    });
  }

  public get email(): AbstractControl | null {
    return this.loginForm.get('email');
  }
  public get emailHasErrorRequired(): boolean {
    return this.email?.hasError('required') ?? false;
  }
  public get emailHasError(): boolean {
    return this.email?.hasError('email') ?? false;
  }
  public get emailHasErrorPattern(): boolean {
    return this.email?.hasError('pattern') ?? false;
  }

  public get password(): AbstractControl | null {
    return this.loginForm.get('password');
  }
  public get passwordhasErrorRequired(): boolean {
    return this.password?.hasError('required') || false;
  }
  public get passwordhasErrorMinLength(): boolean {
    return this.password?.hasError('minlength') || false;
  }
  public get passwordhasErrorPattern(): boolean {
    return this.password?.hasError('pattern') || false;
  }
}
