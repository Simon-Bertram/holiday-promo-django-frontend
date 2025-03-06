"use client";

import { useState } from "react";
import { User } from "@/lib/types/user";
import { useUsersStore } from "@/lib/users/store";
import { useEffect } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, MoreHorizontal } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function UserTable() {
  const { users, isLoading, error, fetchUsers, deleteUser } = useUsersStore();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleEdit = (userId: string) => {
    // This would typically navigate to an edit form or open a modal
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

  if (isLoading) {
    return <div className="flex justify-center py-8">Loading users...</div>;
  }

  if (error) {
    return (
      <div className="py-8 text-center">
        <p className="text-red-500">Error loading users: {error}</p>
        <Button onClick={() => fetchUsers()} className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <>
      <Table>
        <TableCaption>List of regular users in the system.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Verified</TableHead>
            <TableHead>Verified At</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center h-24">
                No users found
              </TableCell>
            </TableRow>
          ) : (
            users.map((user: User) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.id}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  {user.first_name} {user.last_name}
                </TableCell>
                <TableCell>
                  {user.is_verified ? (
                    <Badge
                      variant="outline"
                      className="bg-green-100 text-green-800 border-green-200"
                    >
                      Verified
                    </Badge>
                  ) : (
                    <Badge variant="secondary">Pending</Badge>
                  )}
                </TableCell>
                <TableCell>
                  {user.verified_at
                    ? format(new Date(user.verified_at), "MMM d, yyyy")
                    : "Not verified"}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => handleEdit(user.id)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit user
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => confirmDelete(user.id)}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete user
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              user account and remove their data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
