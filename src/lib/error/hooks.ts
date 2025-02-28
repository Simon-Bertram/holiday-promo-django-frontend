import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppError, ValidationError } from "./types";
import { createAppError, showErrorToast } from "./handlers";

/**
 * Hook to handle async operations with error handling
 */
export function useAsyncOperation<T, Args extends unknown[]>(
  operation: (...args: Args) => Promise<T>,
  options: {
    onSuccess?: (result: T, ...args: Args) => void;
    onError?: (error: AppError, ...args: Args) => void;
    showToastOnError?: boolean;
    showToastOnSuccess?: boolean;
    successMessage?: string;
  } = {}
) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<AppError | null>(null);
  const [result, setResult] = useState<T | null>(null);

  const {
    onSuccess,
    onError,
    showToastOnError = true,
    showToastOnSuccess = false,
    successMessage,
  } = options;

  const execute = useCallback(
    async (...args: Args) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await operation(...args);
        setResult(response);

        if (showToastOnSuccess && successMessage) {
          toast.success(successMessage);
        }

        onSuccess?.(response, ...args);
        return response;
      } catch (err: unknown) {
        const appError = createAppError(err);
        setError(appError);

        if (showToastOnError) {
          showErrorToast(appError);
        }

        onError?.(appError, ...args);
        throw appError;
      } finally {
        setIsLoading(false);
      }
    },
    [
      operation,
      onSuccess,
      onError,
      showToastOnError,
      showToastOnSuccess,
      successMessage,
    ]
  );

  return {
    execute,
    isLoading,
    error,
    result,
    reset: useCallback(() => {
      setError(null);
      setResult(null);
    }, []),
  };
}

/**
 * Hook to handle form submission errors, especially for React Hook Form
 */
export function useFormError() {
  const [error, setError] = useState<AppError | null>(null);

  const handleError = useCallback((err: unknown) => {
    const appError = createAppError(err);
    setError(appError);
    showErrorToast(appError);
    return appError;
  }, []);

  const getFieldErrors = useCallback(() => {
    if (error instanceof ValidationError && error.fieldErrors) {
      return error.fieldErrors;
    }
    return {};
  }, [error]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    error,
    handleError,
    getFieldErrors,
    clearError,
    hasError: !!error,
  };
}

/**
 * Hook for session management - handles 401 unauthorized errors
 */
export function useSessionErrorHandler() {
  const router = useRouter();

  useEffect(() => {
    const handleSessionExpired = () => {
      // Display a message and redirect to login
      showErrorToast("Your session has expired. Please log in again.");
      router.push("/login");
    };

    document.addEventListener("auth:sessionExpired", handleSessionExpired);

    return () => {
      document.removeEventListener("auth:sessionExpired", handleSessionExpired);
    };
  }, [router]);
}

/**
 * Creates a toast notification for errors
 * Note: This is a simple implementation - replace with your toast library if needed
 */
const toast = {
  success: (message: string) => {
    console.log("Success:", message);
    // This is implemented in your imports
  },
  error: (message: string) => {
    console.log("Error:", message);
    // This is implemented in your imports
  },
};
