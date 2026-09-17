import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { IUser } from '../../models/iuser';
import { ApiResponse } from '../../models/api-response';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private _http = inject(HttpClient);
  
  private apiLink = 'http://localhost:3000/auth'; 
  id = signal<string>("");
  resetToken = signal<string>('');
  currentUser = signal<IUser | null>(null);
  isLoggedIn = signal<boolean>(false);

  constructor() {
    if (this.getToken()) {
      this.isLoggedIn.set(true);
    }
  }

  async login(data: Pick<IUser, "email" | "password">) {
    return firstValueFrom(this._http.post<ApiResponse<IUser>>(`${this.apiLink}/login`, data));
  }

  async signup(data: Pick<IUser, "email" | "password" | "name">) {
    return firstValueFrom(this._http.post<ApiResponse<IUser>>(`${this.apiLink}/signup`, data));
  }

  async confirmEmail(data: Pick<IUser, "email" | "confirmOTP">) {
    return firstValueFrom(this._http.post<ApiResponse<IUser>>(`${this.apiLink}/confirm-email`, data));
  }

  async forgetPassword(data: Pick<IUser, "email">) {
    return firstValueFrom(this._http.post<ApiResponse<IUser>>(`${this.apiLink}/forget-password`, data));
  }

  async resetPassword(data: Pick<IUser, "password">) {
    return firstValueFrom(this._http.post<ApiResponse<IUser>>(`${this.apiLink}/reset-password/${this.resetToken()}`, data));
  }

  getToken() {
    return localStorage.getItem("cinema_token");
  }

  logout() {
    localStorage.removeItem("cinema_token");
    this.isLoggedIn.set(false);
    this.currentUser.set(null);
  }

  getPayloadFromToken() {
    const token = this.getToken();
    if (!token) return null;
    try {
      const payload = token.split(".")[1];
      return JSON.parse(atob(payload));
    } catch {
      return null;
    }
  }

  async getMe() {
    return await firstValueFrom(this._http.get<ApiResponse<IUser>>(`${this.apiLink}/me`));
  }
}