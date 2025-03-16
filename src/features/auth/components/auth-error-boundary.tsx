"use client";

import React from "react";
import { ErrorBoundary } from "@/shared/lib/error/components/error-boundary";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { serializeError } from "@/shared/lib/error/components/error-fallback";

interface AuthErrorFallbackProps {
  errorMessage?: string;
  errorCode?: string;
  errorStatusCode?: number;
  resetErrorBoundary: () => void;
}

/**
 * A fallback component specifically for auth-related errors
 */
function AuthErrorFallback({
  errorMessage,
  errorCode,
  errorStatusCode,
  resetErrorBoundary,
}: AuthErrorFallbackProps) {
  const router = useRouter();

  const isAuthError =
    errorCode?.includes("auth/") ||
    errorStatusCode === 401 ||
    errorStatusCode === 403;

  const handleLogin = () => {
    router.push("/auth/login");
  };

  return (
    <div className="p-6 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive max-w-md mx-auto my-8">
      <div className="flex items-start gap-4">
        <AlertCircle className="h-6 w-6 flex-shrink-0 mt-1" />
        <div className="flex-1">
          <h2 className="text-xl font-semibold mb-2">Authentication Error</h2>
          <p className="mb-6 text-destructive/80">
            {isAuthError
              ? "Your session may have expired or you don't have permission to access this resource."
              : errorMessage ||
                "An unexpected error occurred with authentication."}
          </p>

          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              onClick={resetErrorBoundary}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Try again
            </Button>

            <Button variant="default" onClick={handleLogin}>
              Log in
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * An error boundary specifically for auth-related components
 */
export function AuthErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      fallbackRender={(props) => {
        const serializedError = serializeError(props.error);
        return (
          <AuthErrorFallback
            {...serializedError}
            resetErrorBoundary={props.resetErrorBoundary}
          />
        );
      }}
    >
      {children}
    </ErrorBoundary>
  );
}
