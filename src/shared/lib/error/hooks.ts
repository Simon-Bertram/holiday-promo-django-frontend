"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
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
    throwError?: boolean; // Whether to throw the error to be caught by error boundaries
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
    throwError = false,
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

        // If throwError is true, throw the error to be caught by error boundaries
        if (throwError) {
          throw appError;
        }

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
      throwError,
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

  const handleError = useCallback((err: unknown, showToast = true) => {
    const appError = createAppError(err);
    setError(appError);

    if (showToast) {
      showErrorToast(appError);
    }

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
      router.push("/auth/login");
    };

    document.addEventListener("auth:sessionExpired", handleSessionExpired);

    return () => {
      document.removeEventListener("auth:sessionExpired", handleSessionExpired);
    };
  }, [router]);
}

/**
 * Hook to manually throw errors to be caught by error boundaries
 */
export function useErrorBoundary() {
  const [error, setError] = useState<Error | null>(null);

  // If there's an error, throw it to be caught by the nearest error boundary
  if (error) {
    throw error;
  }

  return {
    showBoundary: useCallback((err: unknown) => {
      const appError = createAppError(err);
      setError(appError);
    }, []),
  };
}
