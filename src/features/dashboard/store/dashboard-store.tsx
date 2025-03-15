"use client";

import { createStore } from "zustand/vanilla";
import dashboardService from "@/shared/lib/api/dashboardService";
import { createContext, useContext, useRef } from "react";
import { useStore } from "zustand";

export interface DashboardState {
  regularUserCount: number | null;
  isLoadingUserCount: boolean;
  userCountError: string | null;
  fetchRegularUserCount: () => Promise<void>;
}

const initialState: Pick<
  DashboardState,
  "regularUserCount" | "isLoadingUserCount" | "userCountError"
> = {
  regularUserCount: null,
  isLoadingUserCount: false,
  userCountError: null,
};

export interface PreloadedDashboardState {
  regularUserCount?: number | null;
  isLoadingUserCount?: boolean;
  userCountError?: string | null;
}

// Factory function with preloaded state support
export const createDashboardStore = (
  preloadedState: PreloadedDashboardState = {}
) =>
  createStore<DashboardState>((set) => ({
    ...initialState,
    ...preloadedState,

    fetchRegularUserCount: async () => {
      set({ isLoadingUserCount: true, userCountError: null });

      try {
        const data = await dashboardService.getUserCount();
        set({
          regularUserCount: data.regular_user_count,
          isLoadingUserCount: false,
        });
      } catch (error) {
        console.error("Error fetching user count:", error);
        set({
          userCountError:
            error instanceof Error ? error.message : "Unknown error",
          isLoadingUserCount: false,
        });
      }
    },
  }));

// Create a context to hold the store
export type DashboardStoreType = ReturnType<typeof createDashboardStore>;

const DashboardStoreContext = createContext<DashboardStoreType | null>(null);

// Provider component that creates the store
export function DashboardStoreProvider({
  children,
  preloadedState,
}: {
  children: React.ReactNode;
  preloadedState?: PreloadedDashboardState;
}) {
  const storeRef = useRef<DashboardStoreType | null>(null);
  if (!storeRef.current) {
    storeRef.current = createDashboardStore(preloadedState);
  }

  return (
    <DashboardStoreContext.Provider value={storeRef.current}>
      {children}
    </DashboardStoreContext.Provider>
  );
}

// Hook to use the dashboard store
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
