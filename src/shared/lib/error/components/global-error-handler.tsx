"use client";

import React, { useEffect } from "react";
import { ErrorBoundary } from "./error-boundary";
import { ErrorFallback, serializeError } from "./error-fallback";
import { AppError } from "../types";
import { createAppError, showErrorToast } from "../handlers";
import { useSessionErrorHandler } from "../hooks";

interface GlobalErrorHandlerProps {
  children: React.ReactNode;
  logErrors?: boolean;
}

/**
 * A component that wraps the entire application to provide global error handling
 */
export function GlobalErrorHandler({
  children,
  logErrors = true,
}: GlobalErrorHandlerProps) {
  // Set up session error handling
  useSessionErrorHandler();

  // Set up global error handling for unhandled errors
  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      event.preventDefault();
      const error = createAppError(event.reason);
      console.error("Unhandled Promise Rejection:", error);
      showErrorToast(error);
    };

    const handleError = (event: ErrorEvent) => {
      event.preventDefault();
      const error = createAppError(event.error || event.message);
      console.error("Unhandled Error:", error);
      showErrorToast(error);
    };

    // Add event listeners
    window.addEventListener("unhandledrejection", handleUnhandledRejection);
    window.addEventListener("error", handleError);

    // Clean up
    return () => {
      window.removeEventListener(
        "unhandledrejection",
        handleUnhandledRejection
      );
      window.removeEventListener("error", handleError);
    };
  }, []);

  // Handle errors caught by the error boundary
  const handleError = (error: AppError, errorInfo: React.ErrorInfo) => {
    if (logErrors) {
      console.error("Error caught by GlobalErrorHandler:", error);
      console.error("Component stack:", errorInfo.componentStack);

      // Here you could send the error to an error tracking service like Sentry
      // if (typeof window !== 'undefined' && window.Sentry) {
      //   window.Sentry.captureException(error, { extra: { componentStack: errorInfo.componentStack } });
      // }
    }
  };

  return (
    <ErrorBoundary
      fallbackRender={(props) => {
        const serializedError = serializeError(props.error);
        return (
          <ErrorFallback
            {...serializedError}
            resetErrorBoundary={props.resetErrorBoundary}
          />
        );
      }}
      onError={handleError}
    >
      {children}
    </ErrorBoundary>
  );
}
