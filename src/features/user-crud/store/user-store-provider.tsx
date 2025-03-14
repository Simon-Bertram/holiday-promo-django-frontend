"use client";

import { createContext, useContext, useRef, type ReactNode } from "react";
import { useStore } from "zustand";
import { createUsersStore } from "./user-store";
import type { UsersState } from "./user-store";

// Create context for the store
const UsersStoreContext = createContext<ReturnType<
  typeof createUsersStore
> | null>(null);

// Simple provider component
export function UsersStoreProvider({ children }: { children: ReactNode }) {
  const storeRef = useRef<ReturnType<typeof createUsersStore> | null>(null);

  if (!storeRef.current) {
    storeRef.current = createUsersStore();
  }

  return (
    <UsersStoreContext.Provider value={storeRef.current}>
      {children}
    </UsersStoreContext.Provider>
  );
}

// Simple hook to use the store
export function useUsersStore<T>(selector: (state: UsersState) => T): T {
  const store = useContext(UsersStoreContext);

  if (!store) {
    throw new Error("useUsersStore must be used within UsersStoreProvider");
  }

  return useStore(store, selector);
}
