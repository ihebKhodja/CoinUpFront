import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { CheckboxModule } from 'primeng/checkbox';
import { RouterModule } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register-component',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    InputGroupModule,
    InputGroupAddonModule,
    CheckboxModule,
    RouterModule
  ],
  templateUrl: './register-component.html',
  styleUrl: './register-component.scss',
})
export class RegisterComponent implements OnInit, OnDestroy {
  registerForm!: FormGroup;
  showPassword = false;
  loading$!: Observable<boolean>;
  error$!: Observable<string | null>;

  passwordStrengthLevel = 0;
  passwordStrengthLabel: 'Weak' | 'Medium' | 'Strong' | '—' = '—';
  passwordStrengthLabelClass: 'strength-weak' | 'strength-medium' | 'strength-strong' | '' = '';

  private destroy$ = new Subject<void>();

  constructor(private fb: FormBuilder, private authService: AuthService) {}

  private nonWhitespaceValidator(control: AbstractControl): ValidationErrors | null {
    const value = String(control.value ?? '').trim();
    return value.length ? null : { whitespace: true };
  }

  ngOnInit(): void {
    this.loading$ = this.authService.loading$;
    this.error$ = this.authService.error$;
    this.registerForm = this.fb.group({
      username: ['', [Validators.required, this.nonWhitespaceValidator]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]],
      agreedToTerms: [false, [Validators.requiredTrue]]
    }, {
      validators: this.passwordMatchValidator
    });

    this.password?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((value: string) => {
        this.updatePasswordStrength(value ?? '');
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  passwordMatchValidator(group: FormGroup): { [key: string]: any } | null {
    const password = group.get('password');
    const confirmPassword = group.get('confirmPassword');

    if (password && confirmPassword && password.value !== confirmPassword.value) {
      return { passwordMismatch: true };
    }
    return null;
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  private updatePasswordStrength(password: string): void {
    if (!password) {
      this.passwordStrengthLevel = 0;
      this.passwordStrengthLabel = '—';
      this.passwordStrengthLabelClass = '';
      return;
    }

    const lengthScore = password.length >= 12 ? 2 : password.length >= 8 ? 1 : 0;
    const hasLower = /[a-z]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasDigit = /\d/.test(password);
    const hasSymbol = /[^A-Za-z\d]/.test(password);
    const varietyScore = [hasLower, hasUpper, hasDigit, hasSymbol].filter(Boolean).length;

    const rawScore = lengthScore + (varietyScore >= 3 ? 2 : varietyScore >= 2 ? 1 : 0);
    const level = Math.max(1, Math.min(4, rawScore));
    this.passwordStrengthLevel = level;

    if (level <= 1) {
      this.passwordStrengthLabel = 'Weak';
      this.passwordStrengthLabelClass = 'strength-weak';
    } else if (level === 2) {
      this.passwordStrengthLabel = 'Medium';
      this.passwordStrengthLabelClass = 'strength-medium';
    } else {
      this.passwordStrengthLabel = 'Strong';
      this.passwordStrengthLabelClass = 'strength-strong';
    }
  }

  onRegister(): void {
    if (this.registerForm.valid) {
      const { username, email, password } = this.registerForm.getRawValue();
      const trimmedUsername = String(username ?? '').trim();

      this.authService.register({
        username: trimmedUsername,
        email,
        password
      });
    }
  }

  get username() {
    return this.registerForm.get('username');
  }

  get email() {
    return this.registerForm.get('email');
  }

  get password() {
    return this.registerForm.get('password');
  }

  get confirmPassword() {
    return this.registerForm.get('confirmPassword');
  }

  get agreedToTermsControl() {
    return this.registerForm.get('agreedToTerms');
  }
}
