import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { IUser } from '../../models/iuser';
import { ApiResponse } from '../../models/api-response';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private _http = inject(HttpClient);
  private apiLink = 'http://localhost:3000/users'; 

  async updateProfile(id: string, data: Partial<IUser>) {
    return firstValueFrom(this._http.patch<ApiResponse<IUser>>(`${this.apiLink}/${id}`, data));
  }

  async updateProfileImage(id: string, file: File) {
    const formData = new FormData();
    formData.append('image', file);
    return firstValueFrom(this._http.patch<ApiResponse<IUser>>(`${this.apiLink}/${id}/image`, formData));
  }
}
