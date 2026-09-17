export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  token?: string;
  results?: T; 
  data?: T;
}
