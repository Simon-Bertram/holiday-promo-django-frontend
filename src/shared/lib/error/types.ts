/**
 * Custom error types for the application
 */

// Base application error
export class AppError extends Error {
  public code: string;
  public statusCode?: number;
  public metadata?: Record<string, unknown>;

  constructor(
    message: string,
    code: string,
    statusCode?: number,
    metadata?: Record<string, unknown>
  ) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    this.metadata = metadata;
    // Ensures proper stack trace in modern browsers
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

// API specific errors
export class ApiError extends AppError {
  public response?: {
    data?: Record<string, unknown>;
    status?: number;
    headers?: Record<string, string>;
  };

  constructor(
    message: string,
    code: string,
    statusCode?: number,
    responseData?: unknown,
    metadata?: Record<string, unknown>
  ) {
    super(message, code, statusCode, metadata);
    this.response = responseData as ApiError["response"];
  }
}

// Authentication errors
export class AuthError extends AppError {
  constructor(
    message: string = "Authentication error",
    code: string = "auth_error",
    statusCode?: number,
    metadata?: Record<string, unknown>
  ) {
    super(message, code, statusCode, metadata);
  }
}

// Form validation errors
export class ValidationError extends AppError {
  public fieldErrors?: Record<string, string[]>;

  constructor(
    message: string = "Validation error",
    code: string = "validation_error",
    statusCode?: number,
    fieldErrors?: Record<string, string[]>,
    metadata?: Record<string, unknown>
  ) {
    super(message, code, statusCode, metadata);
    this.fieldErrors = fieldErrors;
  }
}

// Network errors
export class NetworkError extends AppError {
  constructor(
    message: string = "Network error",
    code: string = "network_error",
    statusCode?: number,
    metadata?: Record<string, unknown>
  ) {
    super(message, code, statusCode, metadata);
  }
}

// Not found errors
export class NotFoundError extends AppError {
  constructor(
    message: string = "Resource not found",
    code: string = "not_found",
    statusCode: number = 404,
    metadata?: Record<string, unknown>
  ) {
    super(message, code, statusCode, metadata);
  }
}

// Permission errors
export class PermissionError extends AppError {
  constructor(
    message: string = "Permission denied",
    code: string = "permission_denied",
    statusCode: number = 403,
    metadata?: Record<string, unknown>
  ) {
    super(message, code, statusCode, metadata);
  }
}

// Session errors
export class SessionError extends AppError {
  constructor(
    message: string = "Session expired",
    code: string = "session_expired",
    statusCode?: number,
    metadata?: Record<string, unknown>
  ) {
    super(message, code, statusCode, metadata);
  }
}

// Error codes for application-specific errors
export enum ErrorCode {
  // Auth errors
  INVALID_CREDENTIALS = "auth/invalid-credentials",
  SESSION_EXPIRED = "auth/session-expired",
  UNAUTHORIZED = "auth/unauthorized",
  INSUFFICIENT_PERMISSIONS = "auth/insufficient-permissions",

  // Network errors
  NETWORK_OFFLINE = "network/offline",
  REQUEST_TIMEOUT = "network/timeout",
  SERVER_UNREACHABLE = "network/server-unreachable",

  // API errors
  API_REQUEST_FAILED = "api/request-failed",
  API_RESPONSE_ERROR = "api/response-error",
  API_VALIDATION_ERROR = "api/validation-error",

  // Form errors
  FORM_VALIDATION_ERROR = "form/validation-error",

  // Resource errors
  RESOURCE_NOT_FOUND = "resource/not-found",
  RESOURCE_ALREADY_EXISTS = "resource/already-exists",
  RESOURCE_CONFLICT = "resource/conflict",

  // Generic errors
  UNKNOWN_ERROR = "unknown/error",
  OPERATION_FAILED = "operation/failed",
}

// Map of HTTP status codes to error types - using any here to avoid complex TypeScript casting
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const HTTP_ERROR_MAP: Record<number, any> = {
  400: ValidationError,
  401: AuthError,
  403: PermissionError,
  404: NotFoundError,
  408: NetworkError,
  500: ApiError,
  502: NetworkError,
  503: NetworkError,
  504: NetworkError,
};
