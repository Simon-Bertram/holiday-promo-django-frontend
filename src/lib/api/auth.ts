import apiClient from "./client";
import Cookies from "js-cookie";

export interface User {
  id: number;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  role: "ADMIN" | "MODERATOR" | "USER";
}

export interface AuthResponse {
  access: string;
  refresh: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  username: string;
  password: string;
  password_confirm: string;
  first_name?: string;
  last_name?: string;
}

export interface MagicCodeRequest {
  email: string;
  captchaToken?: string;
}

export interface MagicCodeVerify {
  email: string;
  code: string;
}

export interface AdminLoginData {
  email: string;
  password: string;
}

export interface UserExistsResponse {
  email: string;
  exists: boolean;
  role?: "ADMIN" | "MODERATOR" | "USER";
}

// Check if a user exists
export const checkUserExists = async (data: {
  email: string;
}): Promise<UserExistsResponse> => {
  try {
    const response = await apiClient.post<UserExistsResponse>(
      "/auth/check-user/",
      data
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Login with email and password
export const login = async (credentials: LoginCredentials): Promise<User> => {
  try {
    const response = await apiClient.post<AuthResponse>(
      "/auth/login/",
      credentials
    );

    // Save tokens to cookies
    Cookies.set("access_token", response.data.access);
    Cookies.set("refresh_token", response.data.refresh);

    return response.data.user;
  } catch (error) {
    throw error;
  }
};

// Register a new user
export const register = async (data: RegisterData): Promise<User> => {
  try {
    const response = await apiClient.post<User>("/auth/register/", data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Request a magic code
export const requestMagicCode = async (
  data: MagicCodeRequest
): Promise<{ message: string; email: string }> => {
  try {
    const response = await apiClient.post<{ message: string; email: string }>(
      "/auth/magic-code/request/",
      data
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Verify a magic code
export const verifyMagicCode = async (data: MagicCodeVerify): Promise<User> => {
  try {
    const response = await apiClient.post<AuthResponse>(
      "/auth/magic-code/verify/",
      data
    );

    // Save tokens to cookies
    Cookies.set("access_token", response.data.access);
    Cookies.set("refresh_token", response.data.refresh);

    return response.data.user;
  } catch (error) {
    throw error;
  }
};

// Get current user
export const getCurrentUser = async (): Promise<User> => {
  try {
    const response = await apiClient.get<User>("/user/me/");
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Logout
export const logout = (): void => {
  Cookies.remove("access_token");
  Cookies.remove("refresh_token");
};

// Admin login with password after magic code verification
export const adminLogin = async (data: AdminLoginData): Promise<User> => {
  try {
    const response = await apiClient.post<AuthResponse>(
      "/auth/admin-login/",
      data
    );

    // Save tokens to cookies
    Cookies.set("access_token", response.data.access);
    Cookies.set("refresh_token", response.data.refresh);

    return response.data.user;
  } catch (error) {
    throw error;
  }
};
