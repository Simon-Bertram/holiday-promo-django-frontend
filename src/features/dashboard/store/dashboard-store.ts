import { createStore } from "zustand/vanilla"; // Import from zustand/vanilla
import dashboardService from "@/shared/lib/api/dashboardService";

export interface DashboardState {
  regularUserCount: number | null;
  isLoadingUserCount: boolean;
  userCountError: string | null;
  fetchRegularUserCount: () => Promise<void>;
}

const initialState = {
  regularUserCount: null,
  isLoadingUserCount: false,
  userCountError: null,
};

// Factory function
export const createDashboardStore = () =>
  createStore<DashboardState>((set) => ({
    ...initialState,

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
