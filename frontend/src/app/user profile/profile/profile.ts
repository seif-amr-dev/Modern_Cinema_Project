import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth';
import { IUser } from '../../models/iuser';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class Profile implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  user = signal<IUser | null>(null);
  isLoading = signal<boolean>(true);
  errorMessage = signal<string | null>(null);

  async ngOnInit() {
    try {
      const response: any = await this.authService.getMe();
      this.user.set(response.data || response);
    } catch (err: any) {
      console.error('Failed to load profile:', err);
      this.errorMessage.set(err.error?.message || 'Could not load profile data.');
    } finally {
      this.isLoading.set(false);
    }
  }

  onLogout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}