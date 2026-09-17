import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-forget-password',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule],
  templateUrl: './forget-password.html',
  styleUrl: './forget-password.css'
})
export class ForgetPassword {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  errorMessage: string | null = null;
  successMessage: string | null = null;
  isLoading = false;

  forgetForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  async onSubmit() {
    this.errorMessage = null;
    this.successMessage = null;

    if (this.forgetForm.valid) {
      this.isLoading = true;
      try {
        const response: any = await this.authService.forgetPassword(this.forgetForm.value as any);
        this.successMessage = response.message || 'If an account exists with this email, a reset link has been sent.';
        this.forgetForm.reset();
      } catch (err: any) {
        console.error('Forget password failed:', err);
        this.errorMessage = err.error?.message || 'Something went wrong. Please try again.';
      } finally {
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    }
  }
}
