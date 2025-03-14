"use client";

import { createContext, useContext, useRef, type ReactNode } from "react";
import { useStore } from "zustand";
import { createAuthStore } from "./auth-store";
import type { AuthState } from "./auth-store";

// Create context for the store
const AuthStoreContext = createContext<ReturnType<
  typeof createAuthStore
> | null>(null);

// Simple provider component
export function AuthStoreProvider({ children }: { children: ReactNode }) {
  const storeRef = useRef<ReturnType<typeof createAuthStore> | null>(null);

  if (!storeRef.current) {
    storeRef.current = createAuthStore();
  }

  return (
    <AuthStoreContext.Provider value={storeRef.current}>
      {children}
    </AuthStoreContext.Provider>
  );
}

// Simple hook to use the store
export function useAuthStore<T>(selector: (state: AuthState) => T): T {
  const store = useContext(AuthStoreContext);

  if (!store) {
    throw new Error("useAuthStore must be used within AuthStoreProvider");
  }

  return useStore(store, selector);
}
