import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './auth.html',
  styleUrl: './auth.css',
})
export class Auth {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);

  isLoginMode = true;

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  signupForm = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  toggleMode() {
    this.isLoginMode = !this.isLoginMode;
    // Optional: reset forms when switching modes
    this.loginForm.reset();
    this.signupForm.reset();
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.authService.login(this.loginForm.value).subscribe({
        next: (response) => {
          console.log('Login successful!', response);
          alert('Login successful!');
        },
        error: (error) => {
          console.error('Login failed:', error);
          alert('Invalid email or password');
        },
      });
    } else {
      console.warn('Login form is invalid!', this.loginForm.errors);
    }
  }

  onSignup() {
    if (this.signupForm.valid) {
      this.authService.signup(this.signupForm.value).subscribe({
        next: (res) => {
          console.log('Account created!', res);
          this.toggleMode();
        },
        error: (err) => {
          console.error('Signup failed:', err);
        },
      });
    } else {
      console.warn('Signup form is invalid!', this.signupForm.errors);
    }
  }
}
