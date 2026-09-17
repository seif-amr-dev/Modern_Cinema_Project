import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../core/services/auth';
import { NgOtpInputComponent } from 'ng-otp-input';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [ReactiveFormsModule, NgOtpInputComponent],
  templateUrl: './verify-email.html',
  styleUrl: './verify-email.css',
})
export class VerifyEmail implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef); 

  userEmail = ''; 
  errorMessage: string | null = null; 
  successMessage: string | null = null;

  verifyForm = this.fb.group({
    otp: ['', [Validators.required, Validators.minLength(6)]]
  });

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['email']) {
        this.userEmail = params['email'];
      }
    });
  }

  onOtpChange(otpValue: string) {
    this.verifyForm.controls['otp'].setValue(otpValue);
  }

  async onVerify() {
    this.errorMessage = null;
    this.successMessage = null;

    if (this.verifyForm.valid) {
      const payload: any = {
        email: this.userEmail,
        confirmOTP: this.verifyForm.value.otp!
      };

      try {
        const res = await this.authService.confirmEmail(payload);
        console.log('Verification successful', res);
        this.successMessage = 'Account verified successfully! Redirecting to login...';
        this.cdr.detectChanges(); 
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 1000);

      } catch (err: any) {
        console.error('Verification failed', err);
        this.errorMessage = err.error?.message || 'Invalid or expired OTP. Please try again.';
        this.cdr.detectChanges();
      }
    } else {
      console.warn('Verification form is invalid!');
    }
  }
}