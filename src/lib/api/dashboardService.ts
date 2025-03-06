import apiClient from "./client";
import { endpoints } from "./base-config";

interface UserCountResponse {
  regular_user_count: number;
}

const dashboardService = {
  getUserCount: async (): Promise<UserCountResponse> => {
    const response = await apiClient.get<UserCountResponse>(
      endpoints.userCount
    );
    return response.data;
  },
};

export default dashboardService;
