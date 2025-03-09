// Re-export error types
export * from "./types";

// Re-export error handlers
export * from "./handlers";

// Re-export error hooks
export * from "./hooks";

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
} from "./hooks";

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
};

export default errorHandler;
