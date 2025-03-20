export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: "ADMIN" | "MODERATOR" | "USER";
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password?: string;
  password_confirm?: string;
  first_name?: string;
  last_name?: string;
}

export interface MagicCodeRequest {
  email: string;
  captcha_token: string;
}

export interface MagicCodeVerify {
  email: string;
  code: string;
}

export interface AuthResponse {
  access: string;
  refresh: string;
  user: User;
}

export interface UserExistsResponse {
  exists: boolean;
  message: string;
}
