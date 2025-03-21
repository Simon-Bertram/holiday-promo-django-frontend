"use client";

import { createStore } from "zustand/vanilla";
import { persist, createJSONStorage } from "zustand/middleware";
import { User } from "../hooks/use-auth";
import authService from "../../../shared/lib/api/services/auth-service";
import { createContext, useContext, useRef } from "react";
import { useStore } from "zustand";
import Cookies from "js-cookie";

export interface AuthState {
  // State
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  setUser: (user: User | null) => void;
  setIsAuthenticated: (value: boolean) => void;
  loginWithMagicCode: (data: { email: string; code: string }) => Promise<User>;
  logout: () => Promise<void>;
  deleteAccount: () => Promise<void>;
  clearError: () => void;
}

// Initial state for a new store instance
const initialState: Pick<
  AuthState,
  "user" | "isAuthenticated" | "isLoading" | "error"
> = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

export interface PreloadedAuthState {
  user?: User | null;
  isAuthenticated?: boolean;
  isLoading?: boolean;
  error?: string | null;
}

// Add cookie configuration
const COOKIE_OPTIONS = {
  secure: process.env.NODE_ENV === "production", // Only use secure in production
  sameSite: "strict" as const,
  expires: 7, // 7 days
  path: "/",
};

// Factory function to create a new store
export const createAuthStore = (preloadedState: PreloadedAuthState = {}) => {
  return createStore<AuthState>()(
    persist(
      (set) => ({
        ...initialState, // Use the initial state
        ...preloadedState, // Apply preloaded state

        // Simple setters
        setUser: (user) => set({ user }),
        setIsAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
        clearError: () => set({ error: null }),

        // Async actions
        loginWithMagicCode: async (data) => {
          set({ isLoading: true, error: null });
          try {
            const response = await authService.verifyMagicCode(data);

            // Store tokens in cookies with enhanced security
            if (response.access) {
              Cookies.set("access_token", response.access, COOKIE_OPTIONS);
            }
            if (response.refresh) {
              Cookies.set("refresh_token", response.refresh, COOKIE_OPTIONS);
            }

            const user = response.user;
            // Update state in a single batch to prevent multiple re-renders
            set({
              user,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
            return user;
          } catch (error) {
            // Update state in a single batch
            set({
              error: error instanceof Error ? error.message : "Failed to login",
              isLoading: false,
              user: null,
              isAuthenticated: false,
            });
            throw error;
          }
        },

        logout: async () => {
          try {
            await authService.logout();
            // Remove cookies after successful server logout
            Cookies.remove("access_token", { path: "/" });
            Cookies.remove("refresh_token", { path: "/" });
            set({ user: null, isAuthenticated: false });
          } catch (error) {
            console.error("Logout error:", error);
            // Still clear state and cookies on error
            Cookies.remove("access_token", { path: "/" });
            Cookies.remove("refresh_token", { path: "/" });
            set({ user: null, isAuthenticated: false });
          }
        },

        deleteAccount: async () => {
          set({ isLoading: true, error: null });
          try {
            await authService.deleteAccount();
            set({ user: null, isAuthenticated: false, isLoading: false });
          } catch (error) {
            set({
              error:
                error instanceof Error
                  ? error.message
                  : "Failed to delete account",
              isLoading: false,
            });
            throw error;
          }
        },
      }),
      {
        name: "auth-storage",
        storage: createJSONStorage(() => {
          // Check if window is defined (browser) or not (server)
          if (typeof window !== "undefined") {
            return localStorage;
          }
          return {
            getItem: () => null,
            setItem: () => {},
            removeItem: () => {},
          };
        }),
        // Don't persist loading state or errors, cache snapshot result to avoid infinite loop
        partialize: (state: AuthState) => {
          // Only persist user and authentication state, not loading or errors
          return {
            user: state.user,
            isAuthenticated: state.isAuthenticated,
          };
        },
      }
    )
  );
};

// Create a context to hold the store
export type AuthStoreType = ReturnType<typeof createAuthStore>;

const AuthStoreContext = createContext<AuthStoreType | null>(null);

// Provider component that creates the store
export function AuthStoreProvider({
  children,
  preloadedState,
}: {
  children: React.ReactNode;
  preloadedState?: PreloadedAuthState;
}) {
  const storeRef = useRef<AuthStoreType | null>(null);
  if (!storeRef.current) {
    storeRef.current = createAuthStore(preloadedState);
  }

  return (
    <AuthStoreContext.Provider value={storeRef.current}>
      {children}
    </AuthStoreContext.Provider>
  );
}

// Hook to use the auth store
export function useAuthStore<T>(selector: (state: AuthState) => T): T {
  const store = useContext(AuthStoreContext);
  if (!store) {
    throw new Error("useAuthStore must be used within AuthStoreProvider");
  }
  return useStore(store, selector);
}
