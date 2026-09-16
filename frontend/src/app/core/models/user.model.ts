export type UserRole = 'user' | 'admin';

export type UserGender = 'male' | 'female';

export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: UserGender;
  role: UserRole;
  isActive: boolean;
  image?: string;
  isDeleted?: boolean;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface GetMeResponse {
  success: boolean;
  data: User;
}

export interface UserListResponse {
  success: boolean;
  count: number;
  results: User[];
}

export interface UserResponse {
  success: boolean;
  result: User;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
}

export interface UpdateUserRequest {
  name: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: UserGender;
  image?: string;
}

export interface ChangeUserRoleRequest {
  role: UserRole;
}

export interface MessageResponse {
  success: boolean;
  message: string;
}