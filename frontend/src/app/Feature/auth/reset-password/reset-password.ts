import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.css'
})
export class ResetPassword implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  errorMessage: string | null = null;
  successMessage: string | null = null;
  isLoading = false;

  resetForm = this.fb.group({
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', [Validators.required]]
  }, { validators: this.passwordMatchValidator });

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { mismatch: true };
  }

  ngOnInit() {
    const token = this.route.snapshot.paramMap.get('token');
    if (token) {
      this.authService.resetToken.set(token);
    } else {
      this.errorMessage = 'Invalid or missing password reset link.';
    }
  }

  async onSubmit() {
    this.errorMessage = null;
    this.successMessage = null;

    if (this.resetForm.valid && this.authService.resetToken()) {
      this.isLoading = true;
      try {
        const response: any = await this.authService.resetPassword({
          password: this.resetForm.value.password!
        });
        
        this.successMessage = response.message || 'Password reset successfully.';
        this.resetForm.reset();
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
        
      } catch (err: any) {
        console.error('Reset password failed:', err);
        this.errorMessage = err.error?.message || 'Something went wrong. Please try again.';
      } finally {
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    }
  }
}
