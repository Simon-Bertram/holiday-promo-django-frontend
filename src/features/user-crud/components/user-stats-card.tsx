"use client";

import { useDashboardStore } from "@/features/dashboard/store/dashboard-store-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function UserStatsCard() {
  const { regularUserCount, isLoadingUserCount, userCountError } =
    useDashboardStore((state) => ({
      regularUserCount: state.regularUserCount,
      isLoadingUserCount: state.isLoadingUserCount,
      userCountError: state.userCountError,
    }));

  if (isLoadingUserCount) {
    return <div>Loading...</div>;
  }

  if (userCountError) {
    return <div>Error: {userCountError}</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Stats</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Total Subscribers: {regularUserCount}</p>
      </CardContent>
    </Card>
  );
}
