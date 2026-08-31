import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "info" | "purple";
  size?: "sm" | "md";
  dot?: boolean;
}

const VARIANTS = {
  default: "bg-[var(--bg-surface)] text-[var(--text-secondary)] border border-[var(--border)]",
  success: "bg-[var(--accent-civic-dim)] text-[var(--accent-civic)]",
  warning: "bg-[var(--accent-amber-dim)] text-[var(--accent-amber)]",
  danger: "bg-[var(--accent-red-dim)] text-[var(--accent-red)]",
  info: "bg-[var(--accent-blue-dim)] text-[var(--accent-blue)]",
  purple: "bg-purple-500/10 text-purple-400",
};

const DOT_COLORS = {
  default: "bg-[var(--text-tertiary)]",
  success: "bg-[var(--accent-civic)]",
  warning: "bg-[var(--accent-amber)]",
  danger: "bg-[var(--accent-red)]",
  info: "bg-[var(--accent-blue)]",
  purple: "bg-purple-400",
};

export default function Badge({ children, variant = "default", size = "sm", dot = false }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-medium whitespace-nowrap",
        VARIANTS[variant],
        size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs"
      )}
    >
      {dot && <span className={cn("w-1.5 h-1.5 rounded-full", DOT_COLORS[variant])} />}
      {children}
    </span>
  );
}
