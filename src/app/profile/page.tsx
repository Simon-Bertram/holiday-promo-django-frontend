"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/lib/auth/store";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { redirect } from "next/navigation";

export default function ProfilePage() {
  const { user, isAuthenticated } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

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

  // Generate initials for avatar fallback
  const getInitials = () => {
    if (!user) return "?";
    return `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`;
  };

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-8">My Profile</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Summary Card */}
        <Card className="md:col-span-1">
          <CardHeader className="flex flex-col items-center">
            <Avatar className="h-24 w-24 mb-4">
              <AvatarImage
                src={`https://api.dicebear.com/7.x/initials/svg?seed=${user?.first_name} ${user?.last_name}`}
              />
              <AvatarFallback className="text-lg">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
            {isLoading ? (
              <div className="space-y-2 text-center">
                <Skeleton className="h-8 w-36 mx-auto" />
                <Skeleton className="h-4 w-24 mx-auto" />
              </div>
            ) : (
              <>
                <CardTitle>
                  {user?.first_name} {user?.last_name}
                </CardTitle>
                <CardDescription>{user?.email}</CardDescription>
              </>
            )}
          </CardHeader>
          <CardContent className="text-center">
            <div className="mb-4">
              <div className="text-sm text-muted-foreground mb-1">
                Account Type
              </div>
              {isLoading ? (
                <Skeleton className="h-6 w-20 mx-auto" />
              ) : (
                <div className="font-medium">{user?.role}</div>
              )}
            </div>
            <div className="mb-4">
              <div className="text-sm text-muted-foreground mb-1">Status</div>
              {isLoading ? (
                <Skeleton className="h-6 w-24 mx-auto" />
              ) : (
                <div className="font-medium">Active</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Profile Details Card */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>Your personal account details</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : (
              <dl className="space-y-4">
                <div className="grid grid-cols-3 py-3 border-b">
                  <dt className="font-medium">Email</dt>
                  <dd className="col-span-2 text-muted-foreground">
                    {user?.email}
                  </dd>
                </div>
                <div className="grid grid-cols-3 py-3 border-b">
                  <dt className="font-medium">First Name</dt>
                  <dd className="col-span-2 text-muted-foreground">
                    {user?.first_name}
                  </dd>
                </div>
                <div className="grid grid-cols-3 py-3 border-b">
                  <dt className="font-medium">Last Name</dt>
                  <dd className="col-span-2 text-muted-foreground">
                    {user?.last_name}
                  </dd>
                </div>

                <div className="grid grid-cols-3 py-3 border-b">
                  <dt className="font-medium">Role</dt>
                  <dd className="col-span-2 text-muted-foreground">
                    {user?.role}
                  </dd>
                </div>
              </dl>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
