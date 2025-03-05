"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/auth/store";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function DashboardPage() {
  const { user, isLoading } = useAuthStore();
  const router = useRouter();

  // Redirect users with role "USER" to the profile page
  useEffect(() => {
    if (!isLoading && user?.role === "USER") {
      router.push("/profile");
    }
  }, [user, isLoading, router]);

  // Show loading state while checking permissions
  if (isLoading) {
    return <div>Loading...</div>;
  }

  // If user is a regular user, don't render anything as they will be redirected
  if (user?.role === "USER") {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      <p className="text-muted-foreground">
        Welcome to the admin dashboard. Here you can manage users and access
        administrative features.
      </p>

      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-3">
        <Card className="min-w-md">
          <CardHeader>
            <CardTitle>Your Profile</CardTitle>
            <CardDescription>
              View and edit your profile information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">Email:</span>
                <span>{user?.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Role:</span>
                <span>{user?.role}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Only admins can see this card */}
        {user?.role === "ADMIN" && (
          <Card className="min-w-md">
            <CardHeader>
              <CardTitle>Admin Tools</CardTitle>
              <CardDescription>Access admin-only features</CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                As an admin, you have access to special features and tools to
                manage the system.
              </p>
            </CardContent>
          </Card>
        )}

        {/* User management card only visible to admins and moderators */}
        <Card className="min-w-md">
          <CardHeader>
            <CardTitle>User Management</CardTitle>
            <CardDescription>View and manage system users</CardDescription>
          </CardHeader>
          <CardContent>
            <p>View and manage users in the system.</p>
          </CardContent>
        </Card>

        <Card className="min-w-md">
          <CardHeader>
            <CardTitle>Holiday Promotions</CardTitle>
            <CardDescription>View current holiday promotions</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Check out our latest holiday promotions and special offers!</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
