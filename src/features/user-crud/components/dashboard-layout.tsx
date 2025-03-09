import { User as AuthUser } from "@/features/auth/hooks/use-auth";
import UserStatsCard from "../../../app/(dashboard)/dashboard/components/user-stats-card";

interface DashboardLayoutProps {
  user: AuthUser;
}

export default function DashboardLayout({ user }: DashboardLayoutProps) {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      <p className="text-muted-foreground">
        Welcome {user.first_name || user.email}! Here you can manage users and
        access administrative features.
      </p>

      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-3">
        <UserStatsCard />
      </div>
    </div>
  );
}
