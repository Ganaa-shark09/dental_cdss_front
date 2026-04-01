import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';

import { AuthService } from '../../../core/services/auth.service';
import { ROUTES } from '../../../core/constants/route.constants';
import { CdssSaveButton } from '../../../shared/components/buttons/cdss-save-button/cdss-save-button';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, InputTextModule, PasswordModule, CdssSaveButton],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  loading = false;
  errorMessage = '';

  loginForm = new FormGroup({
    username: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.authService.login(this.loginForm.getRawValue()).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate([`/${ROUTES.app.dashboard}`]);
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage =
          error?.error?.detail ||
          error?.error?.message ||
          'Login failed. Please check your credentials.';
      },
    });
  }

  get usernameControl(): FormControl<string> {
    return this.loginForm.controls.username;
  }

  get passwordControl(): FormControl<string> {
    return this.loginForm.controls.password;
  }
}
