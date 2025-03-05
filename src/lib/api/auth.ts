import apiClient from "./client";
import Cookies from "js-cookie";
import axios from "axios";
import { NetworkError, ErrorCode } from "../error/types";

export interface User {
  id: number;
  email: string;
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
  } catch (error: unknown) {
    console.log("Registration API error:", error);

    // Type for axios error
    type AxiosErrorType = {
      response?: {
        data?: unknown;
        status?: number;
      };
    };

    const err = error as AxiosErrorType;

    // Handle axios error with response data
    if (err.response && err.response.data) {
      // Format the error in a more usable way
      const errorData = err.response.data;

      // If the error data contains field errors (like password validation errors)
      if (typeof errorData === "object" && errorData !== null) {
        const fieldErrors: Record<string, string[]> = {};

        // Process each field error
        Object.entries(errorData as Record<string, unknown>).forEach(
          ([field, messages]) => {
            if (Array.isArray(messages)) {
              fieldErrors[field] = messages.map((msg) => String(msg));
            } else if (messages) {
              // Handle case where message might not be an array
              fieldErrors[field] = [String(messages)];
            }
          }
        );

        // If we found field errors, create a custom error with them
        if (Object.keys(fieldErrors).length > 0) {
          const validationError = new Error("Validation failed");
          (
            validationError as Error & { fieldErrors: Record<string, string[]> }
          ).fieldErrors = fieldErrors;
          throw validationError;
        }
      }

      // If it's a string message or other format
      if (typeof errorData === "string") {
        throw new Error(errorData);
      }
    }

    // If we couldn't extract specific error info, just throw the original error
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
    // Check if it's a timeout error
    if (axios.isAxiosError(error) && error.code === "ECONNABORTED") {
      throw new NetworkError(
        "Request timed out. Please try again.",
        ErrorCode.REQUEST_TIMEOUT
      );
    }
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

// Delete user account
export const deleteAccount = async (): Promise<{ message: string }> => {
  try {
    const response = await apiClient.post<{ message: string }>("/user/delete/");

    // Clear tokens and cookies
    Cookies.remove("access_token");
    Cookies.remove("refresh_token");

    return response.data;
  } catch (error) {
    throw error;
  }
};
