"use client";

import { createContext, useContext, useRef, type ReactNode } from "react";
import { useStore } from "zustand";
import { createDashboardStore } from "./dashboard-store";
import type { DashboardState } from "./dashboard-store";

// Create context for the store
const DashboardStoreContext = createContext<ReturnType<
  typeof createDashboardStore
> | null>(null);

// Simple provider component
export function DashboardStoreProvider({ children }: { children: ReactNode }) {
  const storeRef = useRef<ReturnType<typeof createDashboardStore> | null>(null);

  if (!storeRef.current) {
    storeRef.current = createDashboardStore();
  }

  return (
    <DashboardStoreContext.Provider value={storeRef.current}>
      {children}
    </DashboardStoreContext.Provider>
  );
}

// Simple hook to use the store
export function useDashboardStore<T>(
  selector: (state: DashboardState) => T
): T {
  const store = useContext(DashboardStoreContext);

  if (!store) {
    throw new Error(
      "useDashboardStore must be used within DashboardStoreProvider"
    );
  }

  return useStore(store, selector);
}
