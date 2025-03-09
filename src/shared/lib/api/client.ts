import axios from "axios";
import Cookies from "js-cookie";
import { AuthError, ErrorCode, NetworkError } from "../error/types";
import { createAppError } from "../error/handlers";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

// Create axios instance
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

// Add request interceptor to add auth token to requests
apiClient.interceptors.request.use(
  (config) => {
    const token = Cookies.get("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(createAppError(error));
  }
);

// Add response interceptor to handle token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle token refresh only if:
    // 1. Response status is 401 (Unauthorized)
    // 2. We haven't already tried to refresh the token for this request
    // 3. We have a refresh token available
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      Cookies.get("refresh_token")
    ) {
      originalRequest._retry = true;

      try {
        // Try to refresh the token
        const refreshToken = Cookies.get("refresh_token");
        const response = await axios.post(`${API_URL}/auth/refresh/`, {
          refresh: refreshToken,
        });

        // If token refresh is successful, save the new tokens
        if (response.data?.access) {
          Cookies.set("access_token", response.data.access);

          // Only update refresh token if a new one was provided
          if (response.data.refresh) {
            Cookies.set("refresh_token", response.data.refresh);
          }

          // Update the authorization header and retry the original request
          originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
          return apiClient(originalRequest);
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        // If refresh fails, clear tokens and notify about session expiration
        handleSessionExpiration();
        return Promise.reject(
          new AuthError(
            "Your session has expired. Please log in again.",
            ErrorCode.SESSION_EXPIRED,
            401
          )
        );
      }
    }

    // Handle network errors
    if (!error.response) {
      return Promise.reject(
        new NetworkError(
          "Unable to connect to the server. Please check your internet connection.",
          ErrorCode.NETWORK_OFFLINE
        )
      );
    }

    // For all other errors, convert to our app error format
    return Promise.reject(createAppError(error));
  }
);

// Helper function to handle session expiration
function handleSessionExpiration() {
  // Clear tokens
  Cookies.remove("access_token");
  Cookies.remove("refresh_token");

  // Dispatch event for components to react to
  document.dispatchEvent(
    new CustomEvent("auth:sessionExpired", {
      detail: {
        message: "Your session has expired. Please log in again.",
      },
    })
  );
}

export default apiClient;
