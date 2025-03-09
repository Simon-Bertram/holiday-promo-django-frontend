"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/auth/store";
import { useDashboardStore } from "@/lib/dashboard/store";
import DashboardLayout from "../../../features/user-crud/components/dashboard-layout";

export default function DashboardPage() {
  const { user, isLoading } = useAuthStore();
  const { fetchRegularUserCount } = useDashboardStore();
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

  return <DashboardLayout user={user} />;
}
