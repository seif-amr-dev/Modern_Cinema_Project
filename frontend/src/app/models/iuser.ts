export interface IUser {
  _id?: string;
  name?: string;
  email: string;
  password?: string;
  confirmOTP?: string;
  image?: string;
  role: string;
}
