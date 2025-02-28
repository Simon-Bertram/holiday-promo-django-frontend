"use client";

import { Toaster } from "@/components/ui/sonner";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="container flex h-14 items-center">
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-bold">Holiday Promo</span>
          </Link>
        </div>
      </header>
      <main className="flex-1">
        <div className="container flex items-center justify-center min-h-[calc(100vh-3.5rem)]">
          <div className="w-full max-w-md space-y-6 py-12">{children}</div>
        </div>
      </main>
      <Toaster />
    </div>
  );
}
