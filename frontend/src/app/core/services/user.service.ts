import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  ChangeUserRoleRequest,
  CreateUserRequest,
  MessageResponse,
  UpdateUserRequest,
  UserListResponse,
  UserResponse,
} from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private http = inject(HttpClient);

  private apiUrl = 'http://localhost:3000/users';

  getUsers(params?: HttpParams): Observable<UserListResponse> {
    return this.http.get<UserListResponse>(this.apiUrl, { params });
  }

  createUser(data: CreateUserRequest): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(this.apiUrl, data);
  }

  getUser(id: string): Observable<UserResponse> {
    return this.http.get<UserResponse>(`${this.apiUrl}/${id}`);
  }

  updateUser(id: string, data: UpdateUserRequest): Observable<UserResponse> {
    return this.http.patch<UserResponse>(`${this.apiUrl}/${id}`, data);
  }

  banUser(id: string): Observable<MessageResponse> {
    return this.http.patch<MessageResponse>(`${this.apiUrl}/ban/${id}`, {});
  }

  restoreUser(id: string): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(`${this.apiUrl}/restore/${id}`, {});
  }

  changeUserRole(
    id: string,
    data: ChangeUserRoleRequest,
  ): Observable<UserResponse> {
    return this.http.patch<UserResponse>(`${this.apiUrl}/role/${id}`, data);
  }

  deleteUser(id: string): Observable<MessageResponse> {
    return this.http.delete<MessageResponse>(`${this.apiUrl}/${id}`);
  }
}