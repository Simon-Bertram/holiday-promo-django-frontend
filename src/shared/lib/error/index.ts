// Re-export error types
export * from "./types";

// Re-export error handlers
export * from "./handlers";

// Re-export error hooks
export * from "./hooks";

// Re-export error components
// Note: We're not re-exporting error-boundary to avoid name conflicts
export * from "./components/error-fallback";
export * from "./components/global-error-handler";

// Export a default object with all common utilities
import {
  showErrorToast,
  handleApiError,
  formatErrorMessage,
  createAppError,
} from "./handlers";

import {
  useAsyncOperation,
  useFormError,
  useSessionErrorHandler,
  useErrorBoundary,
} from "./hooks";

import { ErrorBoundary } from "./components/error-boundary";

import { ErrorFallback } from "./components/error-fallback";

import { GlobalErrorHandler } from "./components/global-error-handler";

const errorHandler = {
  // Handlers
  showErrorToast,
  handleApiError,
  formatErrorMessage,
  createAppError,

  // Hooks
  useAsyncOperation,
  useFormError,
  useSessionErrorHandler,
  useErrorBoundary,

  // Components
  ErrorBoundary,
  ErrorFallback,
  GlobalErrorHandler,
};

export default errorHandler;
