import apiClient from "../client";
import {
  User,
  LoginCredentials,
  RegisterData,
  MagicCodeRequest,
  MagicCodeVerify,
  AuthResponse,
  UserExistsResponse,
} from "../../../../features/auth/hooks/use-auth"; // Import types from the original auth.ts
import { endpoints } from "../base-config";
import axios from "axios";
import { NetworkError, ErrorCode } from "../../error/types";

const authService = {
  checkUserExists: async (data: {
    email: string;
  }): Promise<UserExistsResponse> => {
    const response = await apiClient.post<UserExistsResponse>(
      endpoints.checkUserExists,
      data
    );
    return response.data;
  },

  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    // Return AuthResponse
    const response = await apiClient.post<AuthResponse>(
      endpoints.login,
      credentials
    );
    return response.data; // Return the full response data
  },

  register: async (data: RegisterData): Promise<User> => {
    try {
      const response = await apiClient.post<User>(endpoints.register, data);
      return response.data;
    } catch (error: unknown) {
      console.log("Registration API error:", error);

      type AxiosErrorType = {
        response?: {
          data?: unknown;
          status?: number;
        };
      };

      const err = error as AxiosErrorType;

      if (err.response && err.response.data) {
        const errorData = err.response.data;

        if (typeof errorData === "object" && errorData !== null) {
          const fieldErrors: Record<string, string[]> = {};

          Object.entries(errorData as Record<string, unknown>).forEach(
            ([field, messages]) => {
              if (Array.isArray(messages)) {
                fieldErrors[field] = messages.map((msg) => String(msg));
              } else if (messages) {
                fieldErrors[field] = [String(messages)];
              }
            }
          );

          if (Object.keys(fieldErrors).length > 0) {
            const validationError = new Error("Validation failed");
            (
              validationError as Error & {
                fieldErrors: Record<string, string[]>;
              }
            ).fieldErrors = fieldErrors;
            throw validationError;
          }
        }

        if (typeof errorData === "string") {
          throw new Error(errorData);
        }
      }
      throw error;
    }
  },

  requestMagicCode: async (
    data: MagicCodeRequest
  ): Promise<{ message: string; email: string }> => {
    const response = await apiClient.post<{ message: string; email: string }>(
      endpoints.requestMagicCode,
      data
    );
    return response.data;
  },

  verifyMagicCode: async (data: MagicCodeVerify): Promise<AuthResponse> => {
    // Return AuthResponse
    try {
      const response = await apiClient.post<AuthResponse>(
        endpoints.verifyMagicCode,
        data
      );
      return response.data; // Return full response
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
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get<User>(endpoints.getCurrentUser);
    return response.data;
  },

  logout: async (): Promise<void> => {
    // Call the backend logout endpoint
    await apiClient.post(endpoints.logout);
  },

  deleteAccount: async (): Promise<{ message: string }> => {
    const response = await apiClient.post<{ message: string }>(
      endpoints.deleteAccount
    );
    return response.data;
  },
};

export default authService;
