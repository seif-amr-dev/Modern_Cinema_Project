import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api/users';

  login(credentials: any) {
    return this.http.post(`${this.apiUrl}/login`, credentials);
  }
  signup(userData: any) {
    return this.http.post('http://localhost:3000/auth/signup', userData);
  }
}
