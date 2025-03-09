"use client";

import { createContext, ReactNode, useContext, useRef, type FC } from "react";
import { useStore } from "zustand";
import { createAuthStore } from "@/features/auth/store/auth-store"; // Import factory
import type { AuthState } from "@/features/auth/store/auth-store";

type AuthStoreApi = ReturnType<typeof createAuthStore>;

const AuthStoreContext = createContext<AuthStoreApi | undefined>(undefined);

interface AuthStoreProviderProps {
  children: ReactNode;
}

export const AuthStoreProvider: FC<AuthStoreProviderProps> = ({ children }) => {
  const storeRef = useRef<AuthStoreApi | null>(null);
  if (!storeRef.current) {
    storeRef.current = createAuthStore(); // Create a new store instance
  }

  return (
    <AuthStoreContext.Provider value={storeRef.current}>
      {children}
    </AuthStoreContext.Provider>
  );
};

// Custom hook to use the store
export const useAuthStore = <T,>(selector: (state: AuthState) => T): T => {
  const store = useContext(AuthStoreContext);
  if (!store) {
    throw new Error("Missing AuthStoreProvider");
  }
  return useStore(store, selector);
};
