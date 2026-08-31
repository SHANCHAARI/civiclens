"use client";

import { cn } from "@/lib/utils";

interface TabsProps {
  tabs: Array<{ id: string; label: string; count?: number }>;
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}

export default function Tabs({ tabs, activeTab, onChange, className }: TabsProps) {
  return (
    <div className={cn("flex gap-1 p-1 rounded-xl bg-[var(--bg-tertiary)]/50", className)}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
            activeTab === tab.id
              ? "bg-[var(--card-bg)] text-[var(--text-primary)] shadow-sm"
              : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
          )}
        >
          {tab.label}
          {tab.count !== undefined && (
            <span
              className={cn(
                "text-[10px] px-1.5 py-0.5 rounded-full font-medium",
                activeTab === tab.id
                  ? "bg-[var(--accent-subtle)] text-[var(--accent)]"
                  : "bg-[var(--bg-tertiary)] text-[var(--text-tertiary)]"
              )}
            >
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
