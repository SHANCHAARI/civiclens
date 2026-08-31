"use client";

import Link from "next/link";
import { ChevronRight, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import NotificationBell from "./NotificationBell";

interface HeaderProps {
  user?: { name?: string | null; email?: string | null; role?: string };
  breadcrumbs?: Array<{ label: string; href?: string }>;
}

export default function Header({ user, breadcrumbs = [] }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 h-12 flex items-center justify-between px-4 md:px-6 bg-[var(--bg-primary)]/80 backdrop-blur-md border-b border-[var(--border-subtle)]">
      <div className="flex items-center gap-1.5 text-xs overflow-x-auto">
        <Link href="/dashboard" className="text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors whitespace-nowrap">
          Home
        </Link>
        {breadcrumbs.map((crumb, i) => (
          <span key={i} className="flex items-center gap-1.5 whitespace-nowrap">
            <ChevronRight size={12} className="text-[var(--text-tertiary)]/50 shrink-0" />
            {crumb.href ? (
              <Link href={crumb.href} className="text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors">
                {crumb.label}
              </Link>
            ) : (
              <span className="text-[var(--text-primary)] font-medium">{crumb.label}</span>
            )}
          </span>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <NotificationBell />
        {user && (
          <div className="flex items-center gap-2">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-medium text-[var(--text-primary)] leading-tight">{user.name}</p>
              <p className="text-[9px] text-[var(--text-tertiary)] uppercase tracking-widest">{user.role}</p>
            </div>
            <div className="w-7 h-7 rounded-lg bg-[var(--accent-civic-dim)] text-[var(--accent-civic)] flex items-center justify-center text-xs font-bold">
              {user.name?.charAt(0) || "U"}
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="p-1.5 rounded-lg text-[var(--text-tertiary)] hover:text-[var(--accent-red)] hover:bg-[var(--accent-red-dim)] transition-colors"
              aria-label="Sign out"
            >
              <LogOut size={14} />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
