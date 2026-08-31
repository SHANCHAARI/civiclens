"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

export default function AppLayout({
  children,
  breadcrumbs,
}: {
  children: React.ReactNode;
  breadcrumbs?: Array<{ label: string; href?: string }>;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-3 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-[var(--text-tertiary)]">Loading CivicLens...</p>
        </div>
      </div>
    );
  }

  const userRole = (session?.user as any)?.role || "CITIZEN";

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] bg-atmosphere">
      <Sidebar userRole={userRole} />
      <div className="ml-[240px] transition-all duration-300">
        <Header
          user={session?.user as any}
          breadcrumbs={breadcrumbs}
        />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
