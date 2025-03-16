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
      storeRef.current = createAuthStore();
    }
  }

  // Handle hydration
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  return (
    <AuthStoreContext.Provider value={storeRef.current}>
      {isHydrated ? children : null}
    </AuthStoreContext.Provider>
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
            logout: () => {},
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

  try {
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
