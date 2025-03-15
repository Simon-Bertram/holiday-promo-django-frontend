"use client";

import { ReactNode } from "react";
import { AuthStoreProvider } from "@/features/auth/store/auth-store-provider";
import { DashboardStoreProvider } from "@/features/dashboard/store/dashboard-store-provider";
import { UsersStoreProvider } from "@/features/user-crud/store/user-store-provider";

interface RootStoreProviderProps {
  children: ReactNode;
}

/**
 * Root store provider that combines all store providers
 * This allows for easier composition of stores
 */
export function RootStoreProvider({ children }: RootStoreProviderProps) {
  return (
    <AuthStoreProvider>
      <DashboardStoreProvider>
        <UsersStoreProvider>{children}</UsersStoreProvider>
      </DashboardStoreProvider>
    </AuthStoreProvider>
  );
}
