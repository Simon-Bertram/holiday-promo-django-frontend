"use client";

import { createContext, ReactNode, useContext, useRef, type FC } from "react";
import { useStore } from "zustand";
import { createUsersStore } from "@/features/user-crud/store/user-store";
import type { UsersState } from "@/features/user-crud/store/user-store";
type UsersStoreApi = ReturnType<typeof createUsersStore>;

const UsersStoreContext = createContext<UsersStoreApi | undefined>(undefined);

interface UsersStoreProviderProps {
  children: ReactNode;
}

export const UsersStoreProvider: FC<UsersStoreProviderProps> = ({
  children,
}) => {
  const storeRef = useRef<UsersStoreApi | null>(null);
  if (!storeRef.current) {
    storeRef.current = createUsersStore(); // Create a new store instance
  }

  return (
    <UsersStoreContext.Provider value={storeRef.current}>
      {children}
    </UsersStoreContext.Provider>
  );
};

// Custom hook to use the store
export const useUsersStore = <T,>(selector: (state: UsersState) => T): T => {
  const store = useContext(UsersStoreContext);
  if (!store) {
    throw new Error("Missing UsersStoreProvider");
  }
  return useStore(store, selector);
};
