"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AppError } from "../types";
import { createAppError } from "../handlers";
import { Button } from "@/components/ui/button";
import { serializeError } from "./error-fallback";

type FallbackRender = (props: {
  error: AppError;
  resetErrorBoundary: () => void;
}) => ReactNode;

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  fallbackRender?: FallbackRender;
  onError?: (error: AppError, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  error: AppError | null;
  hasError: boolean;
}

/**
 * A React error boundary component that catches errors in its child component tree
 * and displays a fallback UI instead of crashing the whole application.
 */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: unknown): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error: createAppError(error),
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log the error to an error reporting service
    console.error("Error caught by ErrorBoundary:", error, errorInfo);

    // Call the onError callback if provided
    if (this.props.onError) {
      this.props.onError(createAppError(error), errorInfo);
    }
  }

  resetErrorBoundary = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError && this.state.error) {
      // Use the fallbackRender prop if provided
      if (this.props.fallbackRender) {
        return this.props.fallbackRender({
          error: this.state.error,
          resetErrorBoundary: this.resetErrorBoundary,
        });
      }

      // Use the fallback prop if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI - use serialized error properties
      const { errorMessage } = serializeError(this.state.error);
      return (
        <div className="p-6 rounded-lg bg-destructive/10 text-destructive">
          <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
          <p className="mb-4">
            {errorMessage || "An unexpected error occurred"}
          </p>
          <Button variant="outline" onClick={this.resetErrorBoundary}>
            Try again
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * A hook to manually trigger the nearest error boundary
 */
export function useErrorBoundary() {
  const [error, setError] = React.useState<Error | null>(null);

  if (error) {
    throw error;
  }

  return {
    showBoundary: (err: unknown) => {
      setError(err instanceof Error ? err : new Error(String(err)));
    },
  };
}
