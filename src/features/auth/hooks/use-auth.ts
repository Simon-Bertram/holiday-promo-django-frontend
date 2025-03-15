import {
  User,
  LoginCredentials,
  RegisterData,
  MagicCodeRequest,
  MagicCodeVerify,
  AuthResponse,
  UserExistsResponse,
} from "../types/auth-types";

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

// Export the getCurrentUser function
export const getCurrentUser = async (): Promise<User> => {
  const response = await apiClient.get<User>(endpoints.getCurrentUser);
  return response.data;
};

// Re-export types for backward compatibility
export type {
  User,
  LoginCredentials,
  RegisterData,
  MagicCodeRequest,
  MagicCodeVerify,
  AuthResponse,
  UserExistsResponse,
};
