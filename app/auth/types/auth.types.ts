export interface User {
  uid: string;
  email: string;
  name?: string;
  phoneNumber?: string;
  role: string;
}

export interface AuthResponse {
  jwtToken: string;
  user: User;
}