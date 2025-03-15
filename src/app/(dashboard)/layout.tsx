"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/features/auth/hooks/use-auth";
import { useAuthStore } from "@/features/auth/store/auth-store-provider";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, setUser, isAuthenticated, setIsAuthenticated, isLoading } =
    useAuthStore((state) => ({
      user: state.user,
      setUser: state.setUser,
      isAuthenticated: state.isAuthenticated,
      setIsAuthenticated: state.setIsAuthenticated,
      isLoading: state.isLoading,
    }));

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await getCurrentUser();
        setUser(userData);
        setIsAuthenticated(true);

        // Redirect non-admin/moderator users away from dashboard
        if (userData.role !== "ADMIN" && userData.role !== "MODERATOR") {
          router.push("/profile");
        }
      } catch (error) {
        console.error("Failed to fetch user:", error);
        router.push("/auth/login");
      }
    };

    if (!isAuthenticated || !user) {
      fetchUser();
    } else {
      // Redirect non-admin/moderator users away from dashboard
      if (user.role !== "ADMIN" && user.role !== "MODERATOR") {
        router.push("/profile");
      }
    }
  }, [isAuthenticated, router, setIsAuthenticated, setUser, user]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  // Only render dashboard for authenticated admin/moderator users
  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="container flex flex-1">
      <aside className="w-64 border-r pr-6 py-8">
        <nav className="space-y-2">
          <Link href="/dashboard" className="block py-2 hover:underline">
            Dashboard Home
          </Link>
          {user?.role === "ADMIN" && (
            <>
              <Link
                href="/dashboard/admin"
                className="block py-2 hover:underline"
              >
                Admin Panel
              </Link>
              <Link
                href="/dashboard/users"
                className="block py-2 hover:underline"
              >
                Manage Users
              </Link>
            </>
          )}
          <Link
            href="/dashboard/profile"
            className="block py-2 hover:underline"
          >
            My Profile
          </Link>
        </nav>
      </aside>
      <main className="flex-1 py-8 pl-6">{children}</main>
    </div>
  );
}
