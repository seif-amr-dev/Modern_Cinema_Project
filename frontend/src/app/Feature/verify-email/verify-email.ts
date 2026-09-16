import { Component, inject, OnInit } from '@angular/core';
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

  userEmail = ''; 

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

  onVerify() {
    if (this.verifyForm.valid) {
      const payload = {
        email: this.userEmail,
        confirmOTP: this.verifyForm.value.otp!
      };

      this.authService.confirmEmail(payload).subscribe({
        next: (res) => {
          console.log('Verification successful', res);
          alert('Account verified successfully! You can now log in.');
          this.router.navigate(['/login']);
        },
        error: (err) => {
          console.error('Verification failed', err);
          alert('Invalid or expired OTP. Please try again.');
        }
      });
    }
  }
}