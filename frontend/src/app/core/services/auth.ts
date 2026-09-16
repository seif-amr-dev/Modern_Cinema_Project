import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private authUrl = 'http://localhost:3000/auth'; 

  // Global state signal to track if the user is logged in
  isLoggedIn = signal<boolean>(false);

  constructor() {
    // Automatically check if a token exists when the app starts
    // This keeps the user logged in even if they refresh the page
    if (localStorage.getItem('cinema_token')) {
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
    localStorage.removeItem('cinema_token');
    this.isLoggedIn.set(false);
  }

  forgetPassword(data: { email: string }) {
    return this.http.post(`${this.authUrl}/forget-password`, data);
  }

  resetPassword(token: string, data: { password: string }) {
    return this.http.post(`${this.authUrl}/reset-password/${token}`, data);
  }

  getMe() {
    // This route requires the JWT token. 
    // You will attach the token automatically using an Angular HTTP Interceptor in your next step.
    return this.http.get(`${this.authUrl}/me`);
  }
}