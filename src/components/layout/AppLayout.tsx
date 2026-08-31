"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import MobileNav from "./MobileNav";

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
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[var(--accent-civic)] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider">Loading</p>
        </div>
      </div>
    );
  }

  const userRole = (session?.user as any)?.role || "CITIZEN";

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <Sidebar userRole={userRole} />
      <div className="md:ml-[220px] ml-0 transition-all duration-300 pb-20 md:pb-0">
        <Header user={session?.user as any} breadcrumbs={breadcrumbs} />
        <main className="p-4 md:p-6 max-w-[1400px]">{children}</main>
      </div>
      <MobileNav userRole={userRole} />
    </div>
  );
}
