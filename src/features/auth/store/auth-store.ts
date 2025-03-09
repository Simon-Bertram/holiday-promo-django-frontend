import { createStore } from "zustand/vanilla";
import { persist, createJSONStorage } from "zustand/middleware";
import { User } from "../hooks/use-auth";
import authService from "../../../shared/lib/api/services/auth-service";

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

// Factory function to create a new store
export const createAuthStore = () => {
  return createStore<AuthState>()(
    persist(
      (set) => ({
        ...initialState, // Use the initial state

        // Simple setters
        setUser: (user) => set({ user }),
        setIsAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
        clearError: () => set({ error: null }),

        // Async actions
        loginWithMagicCode: async (data) => {
          set({ isLoading: true, error: null });
          try {
            const response = await authService.verifyMagicCode(data);
            const user = response.user;
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
            const response = await authService.adminLogin(data);
            const user = response.user;
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
          authService.logout();
          set({ user: null, isAuthenticated: false });
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
        storage: createJSONStorage(() => localStorage),
        // Don't persist loading state or errors
        partialize: (state) => ({
          user: state.user,
          isAuthenticated: state.isAuthenticated,
        }),
      }
    )
  );
};
