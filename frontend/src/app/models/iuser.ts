export interface IUser {
  _id?: string;
  name?: string;
  email: string;
  password?: string;
  confirmOTP?: string;
  image?: string;
  phone?: string;
  dateOfBirth?: string | Date;
  gender?: 'male' | 'female';
  role: string;
}
