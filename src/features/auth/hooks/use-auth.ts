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
  password: string;
  password_confirm: string;
  first_name?: string;
  last_name?: string;
}

export interface MagicCodeRequest {
  email: string;
  captcha_token?: string;
}

export interface MagicCodeVerify {
  email: string;
  code: string;
}

export interface AdminLoginData {
  email: string;
  password: string;
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

// Export the service (this is what your Zustand store will use)
export { default as authService } from "../../../shared/lib/api/services/auth-service";

// Keep the logout function here for backward compatibility
import Cookies from "js-cookie";
export const logout = (): void => {
  Cookies.remove("access_token");
  Cookies.remove("refresh_token");
};

// Export the deleteAccount function for backward compatibility
import apiClient from "../../../shared/lib/api/client";
import { endpoints } from "../../../shared/lib/api/base-config";

export const deleteAccount = async (): Promise<{ message: string }> => {
  const response = await apiClient.post<{ message: string }>(
    endpoints.deleteAccount
  );
  return response.data;
};

export const verifyMagicCode = async (
  data: MagicCodeVerify
): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>(
    endpoints.verifyMagicCode,
    data
  );
  return response.data;
};

export const adminLogin = async (
  data: AdminLoginData
): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>(
    endpoints.adminLogin,
    data
  );
  return response.data;
};

// Export the getCurrentUser function
export const getCurrentUser = async (): Promise<User> => {
  const response = await apiClient.get<User>(endpoints.getCurrentUser);
  return response.data;
};
