"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Compass,
  AlertTriangle,
  Map,
  BarChart3,
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
  { label: "Discover", href: "/dashboard", icon: <Compass size={18} /> },
  { label: "Report", href: "/report", icon: <AlertTriangle size={18} /> },
  { label: "Map", href: "/map", icon: <Map size={18} /> },
  { label: "Insights", href: "/analytics", icon: <BarChart3 size={18} /> },
  { label: "Authority", href: "/authority", icon: <Shield size={18} />, roles: ["AUTHORITY", "ADMIN"] },
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
        "bg-[var(--bg-deep)] border-r border-[var(--border-subtle)]",
        "transition-all duration-300 ease-in-out",
        collapsed ? "w-[60px]" : "w-[220px]"
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 h-14 border-b border-[var(--border-subtle)]">
        <div className="w-7 h-7 rounded-md bg-[var(--accent-civic)] flex items-center justify-center shrink-0">
          <Eye size={14} className="text-[var(--text-inverse)]" />
        </div>
        {!collapsed && (
          <span className="text-sm font-bold tracking-tight text-[var(--text-primary)] uppercase">
            Civic Lens
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        {filteredItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-150",
                isActive
                  ? "bg-[var(--accent-civic-dim)] text-[var(--accent-civic)]"
                  : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)]"
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
      <div className="px-2 py-2 border-t border-[var(--border-subtle)] space-y-1">
        <ThemeToggle className="w-full justify-start h-8" />
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center justify-center w-full h-8 rounded-lg text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] transition-colors"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>
    </aside>
  );
}
