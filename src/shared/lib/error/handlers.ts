import { toast } from "sonner";
import { AxiosError } from "axios";
import {
  AppError,
  ApiError,
  AuthError,
  ValidationError,
  // NetworkError, NotFoundError, PermissionError, and SessionError are used in HTTP_ERROR_MAP
  ErrorCode,
  HTTP_ERROR_MAP,
} from "./types";

/**
 * Formats an error object into a user-friendly message
 */
export function formatErrorMessage(error: unknown): string {
  if (error instanceof AppError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  return "An unknown error occurred";
}

/**
 * Creates an appropriate AppError subclass from an unknown error
 */
export function createAppError(error: unknown): AppError {
  // If it's already an AppError, return it
  if (error instanceof AppError) {
    return error;
  }

  // Handle Axios errors
  if (isAxiosError(error)) {
    const { response } = error;
    const statusCode = response?.status;
    const data = response?.data as Record<string, unknown>;
    const message =
      (data?.detail as string) || error.message || "API request failed";

    // If we have a status code, use our HTTP error map to create the right error type
    if (statusCode && HTTP_ERROR_MAP[statusCode]) {
      const ErrorClass = HTTP_ERROR_MAP[statusCode];
      return new ErrorClass(
        message,
        getErrorCodeFromStatus(statusCode),
        statusCode,
        response
      );
    }

    // For validation errors with field-level errors
    if (statusCode === 400 && typeof data === "object" && data !== null) {
      // Look for field errors in the response data
      const fieldErrors: Record<string, string[]> = {};

      // Collect field errors from the response
      Object.entries(data).forEach(([key, value]) => {
        if (key !== "detail" && key !== "error" && Array.isArray(value)) {
          fieldErrors[key] = Array.isArray(value)
            ? value.map((v) => String(v))
            : [String(value)];
        }
      });

      if (Object.keys(fieldErrors).length > 0) {
        return new ValidationError(
          message,
          ErrorCode.API_VALIDATION_ERROR,
          statusCode,
          fieldErrors,
          { originalError: error }
        );
      }
    }

    // Default to ApiError for any other Axios errors
    return new ApiError(
      message,
      ErrorCode.API_REQUEST_FAILED,
      statusCode,
      response,
      { originalError: error }
    );
  }

  // Handle other types of errors
  if (error instanceof Error) {
    return new AppError(error.message, ErrorCode.UNKNOWN_ERROR, undefined, {
      originalError: error,
    });
  }

  // Handle string errors
  if (typeof error === "string") {
    return new AppError(error, ErrorCode.UNKNOWN_ERROR);
  }

  // Handle anything else
  return new AppError(
    "An unknown error occurred",
    ErrorCode.UNKNOWN_ERROR,
    undefined,
    { originalError: error }
  );
}

/**
 * Shows an error toast with the formatted error message
 */
export function showErrorToast(error: unknown): void {
  const appError = error instanceof AppError ? error : createAppError(error);

  toast.error(formatErrorMessage(appError));
}

/**
 * Handles API errors by creating appropriate error objects and returning them
 */
export function handleApiError(error: unknown): AppError {
  const appError = createAppError(error);

  // You could add additional logging, analytics, or actions here
  if (appError instanceof AuthError && appError.statusCode === 401) {
    // Handle authentication errors by redirecting to login
    // We'll use a listener pattern rather than directly calling router.push
    // to avoid Next.js router dependency in this utility
    document.dispatchEvent(
      new CustomEvent("auth:sessionExpired", { detail: appError })
    );
  }

  return appError;
}

/**
 * Type guard to check if an error is an Axios error
 */
function isAxiosError(error: unknown): error is AxiosError {
  return (
    typeof error === "object" &&
    error !== null &&
    "isAxiosError" in error &&
    (error as { isAxiosError: unknown }).isAxiosError === true
  );
}

/**
 * Gets an appropriate error code based on HTTP status code
 */
function getErrorCodeFromStatus(status: number): string {
  switch (status) {
    case 400:
      return ErrorCode.API_VALIDATION_ERROR;
    case 401:
      return ErrorCode.UNAUTHORIZED;
    case 403:
      return ErrorCode.INSUFFICIENT_PERMISSIONS;
    case 404:
      return ErrorCode.RESOURCE_NOT_FOUND;
    case 408:
      return ErrorCode.REQUEST_TIMEOUT;
    case 409:
      return ErrorCode.RESOURCE_CONFLICT;
    case 500:
    case 502:
    case 503:
    case 504:
      return ErrorCode.SERVER_UNREACHABLE;
    default:
      return ErrorCode.API_RESPONSE_ERROR;
  }
}
