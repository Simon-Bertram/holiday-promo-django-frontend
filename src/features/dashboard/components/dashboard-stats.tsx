"use client";

import { useEffect } from "react";
import { useDashboardStore } from "../store/dashboard-store-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function DashboardStats() {
  // Use the dashboard store with a selector
  const {
    regularUserCount,
    isLoadingUserCount,
    userCountError,
    fetchRegularUserCount,
  } = useDashboardStore((state) => ({
    regularUserCount: state.regularUserCount,
    isLoadingUserCount: state.isLoadingUserCount,
    userCountError: state.userCountError,
    fetchRegularUserCount: state.fetchRegularUserCount,
  }));

  // Fetch data on component mount
  useEffect(() => {
    fetchRegularUserCount();
  }, [fetchRegularUserCount]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoadingUserCount ? (
          <Skeleton className="h-12 w-full" />
        ) : userCountError ? (
          <div className="text-red-500">Error: {userCountError}</div>
        ) : (
          <div className="text-2xl font-bold">
            {regularUserCount !== null ? regularUserCount : "N/A"} Regular Users
          </div>
        )}
      </CardContent>
    </Card>
  );
}
