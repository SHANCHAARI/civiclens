"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  AlertTriangle,
  Map,
  BarChart3,
  Shield,
} from "lucide-react";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Report", href: "/report", icon: AlertTriangle },
  { label: "Map", href: "/map", icon: Map },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
];

export default function MobileNav({ userRole }: { userRole?: string }) {
  const pathname = usePathname();

  const items = [
    ...NAV_ITEMS,
    ...(userRole === "AUTHORITY" || userRole === "ADMIN"
      ? [{ label: "Authority", href: "/authority", icon: Shield }]
      : []),
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass-strong border-t border-[var(--border)] md:hidden">
      <div className="flex items-center justify-around h-16 px-2">
        {items.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all",
                isActive
                  ? "text-[var(--accent)]"
                  : "text-[var(--text-tertiary)]"
              )}
            >
              <Icon size={20} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
