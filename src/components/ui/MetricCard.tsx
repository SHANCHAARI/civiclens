"use client";

import { cn } from "@/lib/utils";
import { HTMLAttributes, forwardRef } from "react";

interface MetricCardProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
}

const MetricCard = forwardRef<HTMLDivElement, MetricCardProps>(
  ({ className, title, value, subtitle, icon, trend, trendValue, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("glass rounded-2xl p-5 transition-all duration-200", className)}
        {...props}
      >
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider">
              {title}
            </p>
            <p className="text-2xl font-bold text-[var(--text-primary)]">{value}</p>
            {subtitle && (
              <p className="text-xs text-[var(--text-tertiary)]">{subtitle}</p>
            )}
            {trend && trendValue && (
              <div className="flex items-center gap-1 mt-1">
                <span
                  className={cn("text-xs font-medium", {
                    "text-green-500": trend === "up",
                    "text-red-500": trend === "down",
                    "text-[var(--text-tertiary)]": trend === "neutral",
                  })}
                >
                  {trend === "up" ? "↑" : trend === "down" ? "↓" : "→"} {trendValue}
                </span>
              </div>
            )}
          </div>
          {icon && (
            <div className="p-2.5 rounded-xl bg-[var(--accent-subtle)] text-[var(--accent)]">
              {icon}
            </div>
          )}
        </div>
      </div>
    );
  }
);

MetricCard.displayName = "MetricCard";
export default MetricCard;
