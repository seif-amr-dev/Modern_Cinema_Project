import { computed, Injectable, inject, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { GetMeResponse, UserRole } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);
  private authUrl = 'http://localhost:3000/auth'; 

  // Global state signal to track if the user is logged in
  isLoggedIn = signal<boolean>(false);

  userRole = signal<UserRole | null>(null);

  isAdmin = computed(() => this.userRole() === 'admin');

  constructor() {
    // Automatically check if a token exists when the app starts
    // This keeps the user logged in even if they refresh the page
    if (isPlatformBrowser(this.platformId) && localStorage.getItem('cinema_token')) {
      this.isLoggedIn.set(true);
    }
  }

  signup(userData: any) {
    return this.http.post(`${this.authUrl}/signup`, userData);
  }

  confirmEmail(data: { email: string; confirmOTP: string }) {
    return this.http.post(`${this.authUrl}/confirm-email`, data);
  }

  login(credentials: any) {
    return this.http.post(`${this.authUrl}/login`, credentials);
  }

  logout() {
    // Clear the token and update the signal to hide the account menu
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('cinema_token');
    }
    this.isLoggedIn.set(false);
    this.userRole.set(null);
  }

  forgetPassword(data: { email: string }) {
    return this.http.post(`${this.authUrl}/forget-password`, data);
  }

  resetPassword(token: string, data: { password: string }) {
    return this.http.post(`${this.authUrl}/reset-password/${token}`, data);
  }

  getMe() {
    // This route requires the JWT token.
    // The token is attached automatically by the auth HTTP interceptor.
    return this.http.get<GetMeResponse>(`${this.authUrl}/me`);
  }
}
