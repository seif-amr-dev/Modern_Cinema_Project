import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private authUrl = 'http://localhost:3000/auth'; 

  signup(userData: any) {
    return this.http.post(`${this.authUrl}/signup`, userData);
  }

  confirmEmail(data: { email: string; confirmOTP: string }) {
    return this.http.post(`${this.authUrl}/confirm-email`, data);
  }

  login(credentials: any) {
    return this.http.post(`${this.authUrl}/login`, credentials);
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