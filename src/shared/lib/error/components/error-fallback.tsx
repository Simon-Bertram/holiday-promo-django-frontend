"use client";

import React from "react";
import { AppError, ErrorCode } from "../types";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw, Home, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

interface ErrorFallbackProps {
  // Replace the non-serializable error object with serializable properties
  errorMessage?: string;
  errorCode?: string;
  errorStatusCode?: number;
  resetErrorBoundary: () => void;
  title?: string;
  showHomeButton?: boolean;
  showBackButton?: boolean;
  showResetButton?: boolean;
}

/**
 * A component that displays a user-friendly error message with actions
 */
export function ErrorFallback({
  errorMessage,
  errorCode,
  errorStatusCode,
  resetErrorBoundary,
  title = "Something went wrong",
  showHomeButton = true,
  showBackButton = true,
  showResetButton = true,
}: ErrorFallbackProps) {
  const router = useRouter();

  // Determine if this is a network error
  const isNetworkError =
    errorCode?.includes("network/") ||
    [
      ErrorCode.SERVER_UNREACHABLE,
      ErrorCode.REQUEST_TIMEOUT,
      ErrorCode.NETWORK_OFFLINE,
    ].includes(errorCode as ErrorCode);

  // Determine if this is an auth error
  const isAuthError =
    errorCode?.includes("auth/") ||
    [
      ErrorCode.UNAUTHORIZED,
      ErrorCode.SESSION_EXPIRED,
      ErrorCode.INVALID_CREDENTIALS,
    ].includes(errorCode as ErrorCode);

  // Get appropriate error message
  const getErrorMessage = () => {
    if (isNetworkError) {
      return "There was a problem connecting to the server. Please check your internet connection and try again.";
    }

    if (isAuthError) {
      return "Your session may have expired. Please log in again to continue.";
    }

    return (
      errorMessage || "An unexpected error occurred. Please try again later."
    );
  };

  return (
    <div className="p-6 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive max-w-md mx-auto my-8">
      <div className="flex items-start gap-4">
        <AlertCircle className="h-6 w-6 flex-shrink-0 mt-1" />
        <div className="flex-1">
          <h2 className="text-xl font-semibold mb-2">{title}</h2>
          <p className="mb-6 text-destructive/80">{getErrorMessage()}</p>

          <div className="flex flex-wrap gap-3">
            {showResetButton && (
              <Button
                variant="outline"
                onClick={resetErrorBoundary}
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Try again
              </Button>
            )}

            {showBackButton && (
              <Button
                variant="ghost"
                onClick={() => router.back()}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Go back
              </Button>
            )}

            {showHomeButton && (
              <Button
                variant="ghost"
                onClick={() => router.push("/")}
                className="flex items-center gap-2"
              >
                <Home className="h-4 w-4" />
                Home
              </Button>
            )}

            {isAuthError && (
              <Button
                variant="default"
                onClick={() => router.push("/auth/login")}
                className="flex items-center gap-2"
              >
                Log in
              </Button>
            )}
          </div>

          {process.env.NODE_ENV === "development" && (
            <div className="mt-6 p-3 bg-destructive/5 rounded text-xs font-mono overflow-auto max-h-32">
              <p className="font-semibold mb-1">
                Error details (development only):
              </p>
              <p>Code: {errorCode || "UNKNOWN"}</p>
              {errorStatusCode && <p>Status: {errorStatusCode}</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper function to extract serializable properties from an AppError
export function serializeError(error: AppError) {
  return {
    errorMessage: error.message,
    errorCode: error.code,
    errorStatusCode: error.statusCode,
  };
}
