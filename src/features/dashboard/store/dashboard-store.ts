import { create } from "zustand";
import dashboardService from "@/shared/lib/api/dashboardService";

interface DashboardState {
  regularUserCount: number | null;
  isLoadingUserCount: boolean;
  userCountError: string | null;
  fetchRegularUserCount: () => Promise<void>;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  regularUserCount: null,
  isLoadingUserCount: false,
  userCountError: null,

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
