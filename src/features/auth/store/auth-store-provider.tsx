"use client";

import {
  createContext,
  useContext,
  useRef,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useStore } from "zustand";
import { createAuthStore } from "./auth-store";
import type { AuthState } from "./auth-store";
import { ErrorBoundary } from "@/shared/lib/error/components/error-boundary";
import { createAppError } from "@/shared/lib/error/handlers";
import { AppError } from "@/shared/lib/error/types";

// Create context for the store
const AuthStoreContext = createContext<ReturnType<
  typeof createAuthStore
> | null>(null);

// Provider component that creates the store
export function AuthStoreProvider({ children }: { children: React.ReactNode }) {
  const [isHydrated, setIsHydrated] = useState(false);
  const storeRef = useRef<ReturnType<typeof createAuthStore> | null>(null);

  if (!storeRef.current) {
    try {
      storeRef.current = createAuthStore();
    } catch (error) {
      console.error("Failed to create auth store:", error);
      // Create a minimal fallback implementation by retrying
      // If this also fails, the app will crash, but that's better than
      // trying to create a complex mock of the store API
      try {
        storeRef.current = createAuthStore();
      } catch (retryError) {
        // If we still can't create the store, throw a more descriptive error
        throw createAppError(retryError || "Failed to initialize auth store");
      }
    }
  }

  // Handle hydration
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Custom error fallback for auth store errors
  const renderFallback = ({
    error,
    resetErrorBoundary,
  }: {
    error: AppError;
    resetErrorBoundary: () => void;
  }) => {
    // Extract serializable properties from the error
    const errorMessage = error.message;

    return (
      <div className="p-6 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive max-w-md mx-auto my-8">
        <h2 className="text-xl font-semibold mb-2">Authentication Error</h2>
        <p className="mb-4">
          There was a problem initializing the authentication system.
          {process.env.NODE_ENV === "development" && (
            <span className="block mt-2 text-xs opacity-70">
              {errorMessage}
            </span>
          )}
        </p>
        <button
          onClick={resetErrorBoundary}
          className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
        >
          Try again
        </button>
      </div>
    );
  };

  return (
    <ErrorBoundary fallbackRender={renderFallback}>
      <AuthStoreContext.Provider value={storeRef.current}>
        {isHydrated ? children : null}
      </AuthStoreContext.Provider>
    </ErrorBoundary>
  );
}

// Hook to use the auth store with error handling and fallback values
export function useAuthStore<T>(selector: (state: AuthState) => T): T {
  const store = useContext(AuthStoreContext);

  if (!store) {
    throw new Error("useAuthStore must be used within AuthStoreProvider");
  }

  // Create a memoized selector wrapper to handle errors
  const safeSelectorWrapper = useCallback(
    (state: AuthState): T => {
      try {
        // Handle potential null state
        if (!state) {
          console.warn("Auth store state is null, using fallback values");
          const fallbackState: AuthState = {
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
            setUser: () => {},
            setIsAuthenticated: () => {},
            loginWithMagicCode: async () => ({
              id: 0,
              email: "",
              first_name: "",
              last_name: "",
              role: "USER",
            }),
            logout: async () => {},
            deleteAccount: async () => {},
            clearError: () => {},
          };
          return selector(fallbackState);
        }
        return selector(state);
      } catch (error) {
        console.error("Error in auth store selector:", error);
        // Return a sensible default value based on the selector's return type
        return null as unknown as T;
      }
    },
    [selector]
  );

  // Use a stable reference for the store to prevent infinite loops
  try {
    // Use a stable reference for the store to prevent infinite loops
    // The useStore hook from Zustand will handle subscription and updates
    return useStore(store, safeSelectorWrapper);
  } catch (error) {
    console.error("Error accessing auth store:", error);

    // Create a fallback value based on common selector patterns
    const fallbackValue = null as unknown as T;

    // In development, rethrow to help with debugging
    if (process.env.NODE_ENV === "development") {
      throw error;
    }

    // In production, return a fallback value to prevent app crashes
    return fallbackValue;
  }
}
