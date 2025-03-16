"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/features/auth/store/auth-store-provider";

export function Header() {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
      // Optionally show an error message to the user
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      <div className="container mx-auto flex h-14 items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <span className="font-bold">Holiday Promo</span>
        </Link>
        <div className="flex items-center space-x-4">
          {isAuthenticated && user ? (
            <>
              <div className="flex items-center space-x-4">
                <span className="text-sm">
                  Welcome,{" "}
                  {user.first_name ||
                    (user.email ? user.email.split("@")[0] : "User")}
                </span>
                {user.role === "ADMIN" || user.role === "MODERATOR" ? (
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/dashboard">Dashboard</Link>
                  </Button>
                ) : (
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/profile">Profile</Link>
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  Logout
                </Button>
              </div>
            </>
          ) : (
            <>
              <Link href="/auth/login">
                <Button variant="outline" size="sm">
                  Login
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button size="sm">Register</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
