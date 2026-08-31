"use client";

import Link from "next/link";
import { Bell, ChevronRight, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

interface HeaderProps {
  user?: {
    name?: string | null;
    email?: string | null;
    role?: string;
  };
  breadcrumbs?: Array<{ label: string; href?: string }>;
}

export default function Header({ user, breadcrumbs = [] }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 h-16 flex items-center justify-between px-6 glass border-b border-[var(--border)]">
      <div className="flex items-center gap-2 text-sm">
        <Link href="/dashboard" className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors">
          Home
        </Link>
        {breadcrumbs.map((crumb, i) => (
          <span key={i} className="flex items-center gap-2">
            <ChevronRight size={14} className="text-[var(--text-tertiary)]" />
            {crumb.href ? (
              <Link href={crumb.href} className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors">
                {crumb.label}
              </Link>
            ) : (
              <span className="text-[var(--text-primary)] font-medium">{crumb.label}</span>
            )}
          </span>
        ))}
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-2 rounded-xl text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--hover-bg)] transition-colors">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        {user && (
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium text-[var(--text-primary)]">{user.name}</p>
              <p className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider">
                {user.role}
              </p>
            </div>
            <div className="w-8 h-8 rounded-xl bg-[var(--accent-subtle)] text-[var(--accent)] flex items-center justify-center text-sm font-bold">
              {user.name?.charAt(0) || "U"}
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="p-2 rounded-xl text-[var(--text-tertiary)] hover:text-red-500 hover:bg-red-500/10 transition-colors"
              aria-label="Sign out"
            >
              <LogOut size={18} />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
