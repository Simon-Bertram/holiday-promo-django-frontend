import { create } from "zustand";
import usersService from "@/shared/lib/api/services/user-service";
import { User } from "@/features/user-crud/types/user-type";

interface UsersState {
  users: User[];
  isLoading: boolean;
  error: string | null;
  fetchUsers: () => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
}

export const useUsersStore = create<UsersState>((set) => ({
  users: [],
  isLoading: false,
  error: null,

  fetchUsers: async () => {
    set({ isLoading: true, error: null });

    try {
      const users = await usersService.getUsers();
      set({ users, isLoading: false });
    } catch (error) {
      console.error("Error fetching users:", error);
      set({
        error: error instanceof Error ? error.message : "Unknown error",
        isLoading: false,
      });
    }
  },

  deleteUser: async (userId: string) => {
    try {
      await usersService.deleteUser(userId);
      // Update the users list after successful deletion
      set((state) => ({
        users: state.users.filter((user) => user.id !== userId),
      }));
    } catch (error) {
      console.error("Error deleting user:", error);
      throw error;
    }
  },
}));
