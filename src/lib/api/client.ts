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
    // Convert network errors to our custom error format
    const appError = createAppError(error);
    return Promise.reject(appError);
  }
);

// Add response interceptor to handle token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't tried to refresh the token yet
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
        if (response.data) {
          Cookies.set("access_token", response.data.access);
          if (response.data.refresh) {
            Cookies.set("refresh_token", response.data.refresh);
          }

          // Update the authorization header and retry the original request
          originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
          return apiClient(originalRequest);
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (_refreshError) {
        // Create a custom session error
        const sessionError = new AuthError(
          "Your session has expired. Please log in again.",
          ErrorCode.SESSION_EXPIRED,
          401
        );

        // If refresh fails, remove tokens and trigger session expired event
        Cookies.remove("access_token");
        Cookies.remove("refresh_token");

        // Dispatch a session expired event that can be captured by our hooks
        document.dispatchEvent(
          new CustomEvent("auth:sessionExpired", { detail: sessionError })
        );

        return Promise.reject(sessionError);
      }
    }

    // For network errors, create a custom NetworkError
    if (!error.response) {
      const networkError = new NetworkError(
        "Unable to connect to the server. Please check your internet connection.",
        ErrorCode.NETWORK_OFFLINE
      );
      return Promise.reject(networkError);
    }

    // For all other errors, convert to our app error format
    const appError = createAppError(error);
    return Promise.reject(appError);
  }
);

export default apiClient;
