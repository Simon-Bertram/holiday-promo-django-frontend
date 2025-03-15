"use client";

import { createStore } from "zustand/vanilla";
import usersService from "@/shared/lib/api/services/user-service";
import { User } from "@/features/user-crud/types/user-type";
import { createContext, useContext, useRef } from "react";
import { useStore } from "zustand";

export interface UsersState {
  users: User[];
  isLoading: boolean;
  error: string | null;
  fetchUsers: () => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
}

const initialState: Pick<UsersState, "users" | "isLoading" | "error"> = {
  users: [],
  isLoading: false,
  error: null,
};

export interface PreloadedUsersState {
  users?: User[];
  isLoading?: boolean;
  error?: string | null;
}

// Factory function with preloaded state support
export const createUsersStore = (preloadedState: PreloadedUsersState = {}) =>
  createStore<UsersState>((set) => ({
    ...initialState,
    ...preloadedState,

    fetchUsers: async () => {
      set({ isLoading: true, error: null });

      try {
        const users = await usersService.getUsers();
        set({ users, isLoading: false });
      } catch (error) {
        console.error("Error fetching users:", error);
        set({
          error: error instanceof Error ? error.message : "Unknown error",
          isLoading: false,
        });
      }
    },

    deleteUser: async (userId: string) => {
      try {
        await usersService.deleteUser(userId);
        // Update the users list after successful deletion
        set((state) => ({
          users: state.users.filter((user) => user.id !== userId),
        }));
      } catch (error) {
        console.error("Error deleting user:", error);
        throw error;
      }
    },
  }));

// Create a context to hold the store
export type UsersStoreType = ReturnType<typeof createUsersStore>;

const UsersStoreContext = createContext<UsersStoreType | null>(null);

// Provider component that creates the store
export function UsersStoreProvider({
  children,
  preloadedState,
}: {
  children: React.ReactNode;
  preloadedState?: PreloadedUsersState;
}) {
  const storeRef = useRef<UsersStoreType | null>(null);
  if (!storeRef.current) {
    storeRef.current = createUsersStore(preloadedState);
  }

  return (
    <UsersStoreContext.Provider value={storeRef.current}>
      {children}
    </UsersStoreContext.Provider>
  );
}

// Hook to use the users store
export function useUsersStore<T>(selector: (state: UsersState) => T): T {
  const store = useContext(UsersStoreContext);
  if (!store) {
    throw new Error("useUsersStore must be used within UsersStoreProvider");
  }
  return useStore(store, selector);
}
