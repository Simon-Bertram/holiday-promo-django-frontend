"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { getCurrentUser, logout } from "@/lib/api/auth";
import { useAuthStore } from "@/lib/auth/store";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const {
    user,
    setUser,
    isAuthenticated,
    setIsAuthenticated,
    isLoading,
    setIsLoading,
  } = useAuthStore();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await getCurrentUser();
        setUser(userData);
        setIsAuthenticated(true);
      } catch (error) {
        // If there's an error fetching the user, they're not authenticated
        setUser(null);
        setIsAuthenticated(false);
        router.push("/auth/login");
      } finally {
        setIsLoading(false);
      }
    };

    if (isLoading) {
      fetchUser();
    }
  }, [isLoading, router, setIsAuthenticated, setIsLoading, setUser]);

  const handleLogout = () => {
    logout();
    setUser(null);
    setIsAuthenticated(false);
    router.push("/auth/login");
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="container flex h-14 items-center justify-between">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <span className="font-bold">Holiday Promo Dashboard</span>
          </Link>
          <div className="flex items-center space-x-4">
            {user && (
              <div className="flex items-center space-x-4">
                <span className="text-sm">
                  Welcome, {user.first_name || user.username}
                </span>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  Logout
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>
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
      <Toaster />
    </div>
  );
}
