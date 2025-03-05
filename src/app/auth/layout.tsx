"use client";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex-1">
      <div className="container flex items-center justify-center min-h-[calc(100vh-3.5rem)]">
        <div className="w-full max-w-md space-y-6 py-12">{children}</div>
      </div>
    </main>
  );
}
