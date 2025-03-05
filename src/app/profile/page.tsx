"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/auth/store";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { redirect } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, deleteAccount } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    // Check authentication status
    if (!isAuthenticated) {
      redirect("/auth/login");
    }

    // Simulate loading for better UX
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [isAuthenticated]);

  // Get user initials for avatar
  const getInitials = () => {
    if (!user) return "";

    const firstInitial = user.first_name ? user.first_name.charAt(0) : "";
    const lastInitial = user.last_name ? user.last_name.charAt(0) : "";

    return (firstInitial + lastInitial).toUpperCase();
  };

  // Handle account deletion
  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await deleteAccount();
      toast.success("Your account has been deleted successfully");
      router.push("/auth/login");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to delete account";
      toast.error(errorMessage);
      setIsDeleting(false);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">My Profile</h1>

      {isLoading ? (
        <ProfileSkeleton />
      ) : user ? (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage
                  src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.first_name} ${user.last_name}`}
                  alt={user.first_name}
                />
                <AvatarFallback>{getInitials()}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle>
                  {user.first_name} {user.last_name}
                </CardTitle>
                <CardDescription>{user.email}</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium">Account Type</h3>
                  <p className="text-sm text-muted-foreground">
                    {user.role === "ADMIN"
                      ? "Administrator"
                      : user.role === "MODERATOR"
                      ? "Moderator"
                      : "Standard User"}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium">Email</h3>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              </div>
            </CardContent>
            {user.role === "USER" && (
              <CardFooter>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="w-full">
                      Delete Account
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Are you absolutely sure?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently
                        delete your account and remove all your data from our
                        servers.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteAccount}
                        disabled={isDeleting}
                        className="bg-destructive text-white hover:bg-destructive/90"
                      >
                        {isDeleting ? "Deleting..." : "Delete Account"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardFooter>
            )}
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>
                Your personal account details and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium">Member Since</h3>
                <p className="text-sm text-muted-foreground">
                  {/* Replace with actual join date if available */}
                  January 2023
                </p>
              </div>
              <div>
                <h3 className="font-medium">Last Login</h3>
                <p className="text-sm text-muted-foreground">
                  {/* Replace with actual last login if available */}
                  Today
                </p>
              </div>
              <div>
                <h3 className="font-medium">Account Status</h3>
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-green-500"></div>
                  <p className="text-sm text-muted-foreground">Active</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="text-center py-10">
          <p>Please log in to view your profile.</p>
        </div>
      )}
    </div>
  );
}

// Skeleton loader for profile
function ProfileSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader className="flex flex-row items-center gap-4">
          <Skeleton className="h-16 w-16 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3 w-24" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <Skeleton className="h-4 w-40 mb-2" />
          <Skeleton className="h-3 w-64" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-32" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-20" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
