"use client";

import { createContext, ReactNode, useContext, useRef, type FC } from "react";
import { useStore } from "zustand";
import { createDashboardStore } from "@/features/dashboard/store/dashboard-store";
import type { DashboardState } from "@/features/dashboard/store/dashboard-store";
type DashboardStoreApi = ReturnType<typeof createDashboardStore>;

const DashboardStoreContext = createContext<DashboardStoreApi | undefined>(
  undefined
);

interface DashboardStoreProviderProps {
  children: ReactNode;
}

export const DashboardStoreProvider: FC<DashboardStoreProviderProps> = ({
  children,
}) => {
  const storeRef = useRef<DashboardStoreApi | null>(null);
  if (!storeRef.current) {
    storeRef.current = createDashboardStore(); // Create a new store instance
  }

  return (
    <DashboardStoreContext.Provider value={storeRef.current}>
      {children}
    </DashboardStoreContext.Provider>
  );
};

// Custom hook to use the store
export const useDashboardStore = <T,>(
  selector: (state: DashboardState) => T
): T => {
  const store = useContext(DashboardStoreContext);
  if (!store) {
    throw new Error("Missing DashboardStoreProvider");
  }
  return useStore(store, selector);
};
