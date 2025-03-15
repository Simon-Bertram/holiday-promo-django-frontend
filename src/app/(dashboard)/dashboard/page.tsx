"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/features/auth/store/auth-store-provider";
import { useDashboardStore } from "@/features/dashboard/store/dashboard-store-provider";

export default function DashboardPage() {
  const { user, isLoading } = useAuthStore((state) => ({
    user: state.user,
    isLoading: state.isLoading,
  }));

  const { regularUserCount, fetchRegularUserCount } = useDashboardStore(
    (state) => ({
      regularUserCount: state.regularUserCount,
      fetchRegularUserCount: state.fetchRegularUserCount,
    })
  );

  const router = useRouter();

  // Redirect users with role "USER" to the profile page
  useEffect(() => {
    if (!isLoading && user?.role === "USER") {
      router.push("/profile");
    }
  }, [user, isLoading, router]);

  // Fetch user count when component mounts if user is admin/moderator
  useEffect(() => {
    if (!isLoading && (user?.role === "ADMIN" || user?.role === "MODERATOR")) {
      fetchRegularUserCount();
    }
  }, [user, isLoading, fetchRegularUserCount]);

  // Show loading state while checking permissions
  if (isLoading || !user) {
    return <div>Loading...</div>;
  }

  // If user is a regular user, don't render anything as they will be redirected
  if (user.role === "USER") {
    return null; // Will redirect in useEffect
  }

  // Return dashboard content
  return (
    <div className="dashboard-content">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <div className="stats-card p-6 bg-white rounded-lg shadow-sm">
        <h2 className="text-lg font-medium mb-4">User Statistics</h2>
        <p className="text-3xl font-bold">{regularUserCount || 0}</p>
        <p className="text-sm text-gray-500">Regular Users</p>
      </div>
    </div>
  );
}
