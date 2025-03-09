import apiClient from "../client";
import { endpoints } from "../base-config";
import { User } from "@/features/user-crud/types/user-type";

interface UsersResponse {
  users: User[];
}

const usersService = {
  getUsers: async (): Promise<User[]> => {
    const response = await apiClient.get<UsersResponse>(endpoints.listUsers);
    return response.data.users;
  },

  deleteUser: async (userId: string): Promise<void> => {
    await apiClient.delete(`${endpoints.deleteUser}${userId}/`);
  },
};

export default usersService;
