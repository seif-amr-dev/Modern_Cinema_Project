import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth';

import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule],
  templateUrl: './auth.html',
  styleUrl: './auth.css'
})
export class Auth {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  isLoginMode = true;
  errorMessage: string | null = null;

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  signupForm = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  toggleMode() {
    this.isLoginMode = !this.isLoginMode;
    this.loginForm.reset();
    this.signupForm.reset();
    this.errorMessage = null; 
  }
  async onSubmit() {
    this.errorMessage = null; 

    if (this.loginForm.valid) {
      try {
        const response: any = await this.authService.login(this.loginForm.value as any);
        console.log('Login successful!', response);
        localStorage.setItem('cinema_token', response.token);
        this.authService.isLoggedIn.set(true);
        
        const payload = this.authService.getPayloadFromToken();
        if (payload && payload.role === 'admin') {
          this.router.navigate(['/admin']);
        } else {
          this.router.navigate(['/']);
        }
        
      } catch (err: any) {
        console.error('Login failed:', err);
        this.errorMessage = err.error?.message || 'Invalid email or password';
        this.cdr.detectChanges();
      }
    } else {
      console.warn('Login form is invalid!', this.loginForm.errors);
    }
  }
  async onSignup() {
    this.errorMessage = null;
    
    if (this.signupForm.valid) {
      try {
        const res: any = await this.authService.signup(this.signupForm.value as any);
        
        console.log('Account created!', res);
        const userEmail = this.signupForm.value.email;
        this.router.navigate(['/verify-email'], { queryParams: { email: userEmail } });
        
      } catch (err: any) {
        console.error('Signup failed:', err);
        this.errorMessage = err.error?.message || 'Signup failed. Please try again.';
        this.cdr.detectChanges();
      }
    } else {
      console.warn('Signup form is invalid!', this.signupForm.errors);
    }
  }
}