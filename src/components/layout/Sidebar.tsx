"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Map,
  AlertTriangle,
  BarChart3,
  Settings,
  Shield,
  ChevronLeft,
  ChevronRight,
  Eye,
} from "lucide-react";
import { useState } from "react";
import ThemeToggle from "@/components/ui/ThemeToggle";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  roles?: string[];
}

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: <LayoutDashboard size={20} /> },
  { label: "Report Issue", href: "/report", icon: <AlertTriangle size={20} /> },
  { label: "Civic Map", href: "/map", icon: <Map size={20} /> },
  { label: "Analytics", href: "/analytics", icon: <BarChart3 size={20} /> },
  { label: "Authority", href: "/authority", icon: <Shield size={20} />, roles: ["AUTHORITY", "ADMIN"] },
  { label: "Admin", href: "/admin", icon: <Settings size={20} />, roles: ["ADMIN"] },
];

export default function Sidebar({ userRole = "CITIZEN" }: { userRole?: string }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const filteredItems = NAV_ITEMS.filter(
    (item) => !item.roles || item.roles.includes(userRole)
  );

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-full z-40 flex flex-col",
        "glass-strong border-r border-[var(--border)]",
        "transition-all duration-300 ease-in-out",
        collapsed ? "w-[68px]" : "w-[240px]"
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-[var(--border)]">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[var(--accent)] text-white shrink-0">
          <Eye size={18} />
        </div>
        {!collapsed && (
          <span className="text-lg font-bold tracking-tight text-[var(--text-primary)]">
            CivicLens
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {filteredItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-[var(--accent-subtle)] text-[var(--accent)]"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--hover-bg)]"
              )}
              title={collapsed ? item.label : undefined}
            >
              <span className="shrink-0">{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-3 border-t border-[var(--border)] space-y-2">
        <ThemeToggle className="w-full justify-start" />
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center justify-center w-full p-2 rounded-xl text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--hover-bg)] transition-colors"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>
    </aside>
  );
}
