"use client";

import { createContext, useContext, useRef, useState, useEffect } from "react";
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
    storeRef.current = createAuthStore();
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

// Hook to use the auth store with error handling
export function useAuthStore<T>(selector: (state: AuthState) => T): T {
  const store = useContext(AuthStoreContext);

  if (!store) {
    throw new Error("useAuthStore must be used within AuthStoreProvider");
  }

  try {
    return useStore(store, selector);
  } catch (error) {
    console.error("Error accessing auth store:", error);
    throw error;
  }
}
