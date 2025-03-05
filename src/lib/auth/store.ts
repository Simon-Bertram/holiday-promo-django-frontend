import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  User,
  adminLogin,
  verifyMagicCode,
  logout as apiLogout,
  deleteAccount as apiDeleteAccount,
} from "../api/auth";

interface AuthState {
  // State
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  setUser: (user: User | null) => void;
  setIsAuthenticated: (value: boolean) => void;
  loginWithMagicCode: (data: { email: string; code: string }) => Promise<User>;
  adminLogin: (data: { email: string; password: string }) => Promise<User>;
  logout: () => void;
  deleteAccount: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Simple setters
      setUser: (user) => set({ user }),
      setIsAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
      clearError: () => set({ error: null }),

      // Async actions
      loginWithMagicCode: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const user = await verifyMagicCode(data);
          set({ user, isAuthenticated: true, isLoading: false });
          return user;
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : "Failed to login",
            isLoading: false,
          });
          throw error;
        }
      },

      adminLogin: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const user = await adminLogin(data);
          set({ user, isAuthenticated: true, isLoading: false });
          return user;
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : "Failed to login",
            isLoading: false,
          });
          throw error;
        }
      },

      logout: () => {
        apiLogout(); // Clear cookies or tokens
        set({ user: null, isAuthenticated: false });
      },

      deleteAccount: async () => {
        set({ isLoading: true, error: null });
        try {
          await apiDeleteAccount();
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
      storage: createJSONStorage(() => localStorage),
      // Don't persist loading state or errors
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
