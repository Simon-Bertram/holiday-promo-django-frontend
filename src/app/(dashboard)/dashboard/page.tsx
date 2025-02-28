"use client";

import { useAuthStore } from "@/lib/auth/store";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function DashboardPage() {
  const { user } = useAuthStore();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <p className="text-muted-foreground">
        Welcome to your dashboard. Here you can manage your account and access
        various features.
      </p>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Your Profile</CardTitle>
            <CardDescription>
              View and edit your profile information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">Username:</span>
                <span>{user?.username}</span>
              </div>
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

        {user?.role === "ADMIN" && (
          <Card>
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

        <Card>
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
