"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner"; // assuming this is your toast library
import { useUsersStore } from "../store/user-store-provider";

export function useUsers() {
  const { users, isLoading, error, fetchUsers, deleteUser } = useUsersStore(
    (state) => ({
      users: state.users,
      isLoading: state.isLoading,
      error: state.error,
      fetchUsers: state.fetchUsers,
      deleteUser: state.deleteUser,
    })
  );
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleEdit = (userId: string) => {
    toast("Editing User", {
      description: `Editing user with ID: ${userId}`,
    });
  };

  const confirmDelete = (userId: string) => {
    setUserToDelete(userId);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (userToDelete) {
      try {
        await deleteUser(userToDelete);
        toast("User Deleted", {
          description: "The user has been successfully deleted.",
        });
      } catch (err) {
        console.error("Error deleting user:", err);
        toast("Error", {
          description: "Failed to delete user. Please try again.",
        });
      }
      setIsDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  };

  const cancelDelete = () => {
    setIsDeleteDialogOpen(false);
    setUserToDelete(null);
  };

  return {
    users,
    isLoading,
    error,
    userToDelete,
    isDeleteDialogOpen,
    handleEdit,
    confirmDelete,
    handleDelete,
    cancelDelete,
    refreshUsers: fetchUsers,
  };
}
